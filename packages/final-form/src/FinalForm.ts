/* eslint-disable @typescript-eslint/no-dynamic-delete */

import { ARRAY_ERROR, FORM_ERROR } from "./constants";
import filterFieldState from "./filterFieldState";
import filterFormState from "./filterFormState";
import isPromise from "./isPromise";
import memoize from "./memoize";
import publishFieldState from "./publishFieldState";
import shallowEqual from "./shallowEqual";
import getIn from "./structure/getIn";
import setIn from "./structure/setIn";
import type {
  BoundMutators,
  ChangeValue,
  Config,
  ConfigKey,
  FieldConfig,
  FieldState,
  FieldSubscriber,
  FieldSubscription,
  FieldValidator,
  FormApi,
  FormState,
  FormSubscriber,
  FormSubscription,
  FormValuesShape,
  GetFieldState,
  InitialFormValues,
  InternalFieldState,
  InternalFormState,
  IsEqual,
  MutableState,
  Mutator,
  RenameField,
  Subscriber,
  Subscribers,
  Unsubscribe,
  ValidationErrors,
  ValidationErrorsShape,
} from "./types";

export const configOptions: ConfigKey[] = [
  "debug",
  "initialValues",
  "keepDirtyOnReinitialize",
  "mutators",
  "onSubmit",
  "validate",
  "validateOnBlur",
];

const tripleEquals: IsEqual = (a: any, b: any): boolean => a === b;

type InternalState<FormValues extends FormValuesShape = FormValuesShape> = {
  subscribers: Subscribers<FormState<FormValues>>;
} & MutableState<FormValues>;

export type StateFilter<T> = (
  state: T,
  previousState: T | null | undefined,
  subscription: FieldSubscription,
  force?: boolean,
) => T | null | undefined;

type StateFilterParams<T> = Parameters<StateFilter<T>>;

const hasAnyError = (errors: FormValuesShape): boolean => {
  return Object.keys(errors).some((key) => {
    const value = errors[key];

    if (value && typeof value === "object" && !(value instanceof Error)) {
      return hasAnyError(value);
    }

    return typeof value !== "undefined";
  });
};

function convertToExternalFormState<
  FormValues extends FormValuesShape = FormValuesShape,
>(internalState: InternalFormState<FormValues>): FormState<FormValues> {
  const {
    // kind of silly, but it ensures type safety ¯\_(ツ)_/¯
    active,
    dirtySinceLastSubmit,
    modifiedSinceLastSubmit,
    error,
    errors,
    initialValues,
    pristine,
    status,
    submitting,
    submitFailed,
    submitSucceeded,
    submitError,
    submitErrors,
    valid,
    validating,
    values,
  } = internalState;

  return {
    active,
    dirty: !pristine,
    dirtySinceLastSubmit,
    modifiedSinceLastSubmit,
    error,
    errors,
    hasSubmitErrors: !!(
      submitError ||
      (submitErrors && hasAnyError(submitErrors))
    ),
    hasValidationErrors: !!(error || hasAnyError(errors!)),
    invalid: !valid,
    initialValues,
    pristine,
    status,
    submitting,
    submitFailed,
    submitSucceeded,
    submitError,
    submitErrors,
    valid,
    validating: validating > 0,
    values,
  };
}

function notifySubscriber<T extends Object>(
  subscriber: Subscriber<T>,
  subscription: StateFilterParams<T>[2],
  state: StateFilterParams<T>[0],
  lastState: StateFilterParams<T>[1],
  filter: StateFilter<T>,
  force?: StateFilterParams<T>[3],
): boolean {
  const notification: T | null | undefined = filter(
    state,
    lastState,
    subscription,
    force,
  );
  if (notification) {
    subscriber(notification);
    return true;
  }
  return false;
}

function notify<T extends Object>(
  { entries }: Subscribers<T>,
  state: T,
  lastState: T | null | undefined,
  filter: StateFilter<T>,
  force?: boolean,
): void {
  Object.keys(entries).forEach((key) => {
    const entry = entries[Number(key)];
    if (entry) {
      const { subscription, subscriber, notified } = entry;
      if (
        notifySubscriber(
          subscriber,
          subscription,
          state,
          lastState,
          filter,
          force || !notified,
        )
      ) {
        entry.notified = true;
      }
    }
  });
}

/**
 * Creates a form instance.
 *
 * It takes a `Config` and returns a `FormApi`.
 */
function createForm<FormValues extends FormValuesShape = FormValuesShape>(
  config: Config<FormValues>,
): FormApi<FormValues> {
  if (!config) {
    throw new Error("No config specified");
  }

  let {
    debug,
    destroyOnUnregister,
    keepDirtyOnReinitialize,
    initialValues,
    initialStatus,
    mutators: _mutatorsProp,
    onSubmit,
    validate,
    validateOnBlur,
  } = config;

  let mutatorsProp = _mutatorsProp as {
    [key: string]: Mutator<FormValues>;
  };

  if (!onSubmit) {
    throw new Error("No onSubmit function specified");
  }

  const state: InternalState<FormValues> = {
    subscribers: { index: 0, entries: {} },
    fieldSubscribers: {},
    fields: {},
    formState: {
      asyncErrors: {},
      dirtySinceLastSubmit: false,
      modifiedSinceLastSubmit: false,
      errors: {},
      initialValues: initialValues && { ...initialValues },
      invalid: false,
      pristine: true,
      status: initialStatus,
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      resetWhileSubmitting: false,
      valid: true,
      validating: 0,
      values: initialValues
        ? ({ ...initialValues } as unknown as FormValues)
        : ({} as FormValues),
    },
    lastFormState: undefined,
  };
  let inBatch = 0;
  let validationPaused = false;
  let validationBlocked = false;
  let preventNotificationWhileValidationPaused = false;
  let nextAsyncValidationKey = 0;

  const asyncValidationPromises: { [index: number]: Promise<any> } = {};

  const clearAsyncValidationPromise = (key: number) => (result: any) => {
    delete asyncValidationPromises[key];

    return result;
  };

  const changeValue: ChangeValue<FormValues> = (
    mState: MutableState<FormValues>,
    name: string,
    mutate: (value: any) => any,
  ) => {
    const before = getIn(mState.formState.values, name);
    const after = mutate(before);

    mState.formState.values = setIn(mState.formState.values, name, after) || {};
  };

  const renameField: RenameField<FormValues> = (
    mState: MutableState<FormValues>,
    from: string,
    to: string,
  ) => {
    if (mState.fields[from]) {
      mState.fields = {
        ...mState.fields,
        [to]: {
          ...mState.fields[from],
          name: to,
          // rebind event handlers
          blur: () => api.blur(to),
          change: (value) => api.change(to, value),
          focus: () => api.focus(to),
          lastFieldState: undefined,
        },
      };

      delete mState.fields[from];

      mState.fieldSubscribers = {
        ...mState.fieldSubscribers,
        [to]: mState.fieldSubscribers[from],
      };

      delete mState.fieldSubscribers[from];

      const value = getIn(mState.formState.values, from);

      mState.formState.values =
        setIn(mState.formState.values, from, undefined) || {};
      mState.formState.values = setIn(mState.formState.values, to, value);

      delete mState.lastFormState;
    }
  };

  // bind state to mutators
  const getMutatorApi =
    (key: keyof NonNullable<typeof mutatorsProp>) =>
    (...args: any[]) => {
      if (mutatorsProp) {
        const mutableState: MutableState<FormValues> = {
          formState: state.formState,
          fields: state.fields,
          fieldSubscribers: state.fieldSubscribers,
          lastFormState: state.lastFormState,
        };

        const returnValue = mutatorsProp[key](args, mutableState, {
          changeValue,
          getIn,
          renameField,
          resetFieldState: api.resetFieldState,
          setIn,
          setStatus: api.setStatus,
          shallowEqual,
        });

        state.formState = mutableState.formState;
        state.fields = mutableState.fields;
        state.fieldSubscribers = mutableState.fieldSubscribers;
        state.lastFormState = mutableState.lastFormState;

        runValidation(undefined, () => {
          notifyFieldListeners();
          notifyFormListeners();
        });
        return returnValue;
      }
    };

  const mutatorsApi: BoundMutators<FormValues> = mutatorsProp
    ? Object.keys(mutatorsProp).reduce((result, key) => {
        result[key] = getMutatorApi(key);
        return result;
      }, {} as { [mutator: string]: (...args: any[]) => any })
    : {};

  const runRecordLevelValidation = (
    setErrors: (errors: ValidationErrors, isAsync: boolean) => void,
  ): Promise<any>[] => {
    const promises = [];
    if (validate) {
      const errorsOrPromise = validate({ ...state.formState.values }); // clone to avoid writing

      if (isPromise(errorsOrPromise)) {
        promises.push(
          errorsOrPromise.then((errors) => setErrors(errors, true)),
        );
      } else {
        setErrors(errorsOrPromise, false);
      }
    }
    return promises;
  };

  const getValidators = <FieldValue = any>(
    field: InternalFieldState<FieldValue, FormValues>,
  ) =>
    Object.keys(field.validators).reduce((result, index) => {
      const validator = field.validators[Number(index)]();
      if (validator) {
        result.push(validator);
      }
      return result;
    }, [] as FieldValidator<FieldValue, FormValues>[]);

  const runFieldLevelValidation = <FieldValue = any>(
    field: InternalFieldState<FieldValue, FormValues>,
    setError: (error: any) => void,
  ): Promise<any>[] => {
    const promises: Promise<any>[] = [];
    const validators = getValidators(field);

    if (validators.length) {
      let error: any;

      validators.forEach((validator) => {
        const errorOrPromise = validator(
          getIn(state.formState.values, field.name),
          state.formState.values,
          validator.length === 0 || validator.length === 3
            ? publishFieldState(state.formState, state.fields[field.name])
            : undefined,
        );

        if (errorOrPromise && isPromise(errorOrPromise)) {
          field.validating = true;

          const promise = errorOrPromise.then((err) => {
            if (state.fields[field.name]) {
              state.fields[field.name].validating = false;
              setError(err);
            }
          }); // errors must be resolved, not rejected

          promises.push(promise);
        } else if (!error) {
          // first registered validator wins
          error = errorOrPromise;
        }
      });

      setError(error);
    }

    return promises;
  };

  const runValidation = (
    fieldChanged: string | null | undefined,
    callback: () => void,
  ) => {
    if (validationPaused) {
      validationBlocked = true;
      callback();
      return;
    }

    const { fields, formState } = state;
    const safeFields = { ...fields };
    let fieldKeys = Object.keys(safeFields);
    if (
      !validate &&
      !fieldKeys.some((key) => getValidators(safeFields[key]).length)
    ) {
      callback();
      return; // no validation rules
    }

    // pare down field keys to actually validate
    let limitedFieldLevelValidation = false;
    if (fieldChanged) {
      const changedField = safeFields[fieldChanged];
      if (changedField) {
        const { validateFields } = changedField;
        if (validateFields) {
          limitedFieldLevelValidation = true;
          fieldKeys = validateFields.length
            ? validateFields.concat(fieldChanged)
            : [fieldChanged];
        }
      }
    }

    let recordLevelErrors: ValidationErrorsShape = {};
    let asyncRecordLevelErrors: ValidationErrorsShape = {};
    const fieldLevelErrors = {} as Record<string, any>;

    const promises = [
      ...runRecordLevelValidation((errors, wasAsync) => {
        if (wasAsync) {
          asyncRecordLevelErrors = errors || {};
        } else {
          recordLevelErrors = errors || {};
        }
      }),
      ...fieldKeys.reduce((result, name) => {
        const validationPromise = runFieldLevelValidation(
          fields[name],
          (error?: any) => {
            fieldLevelErrors[name] = error;
          },
        );

        return result.concat(validationPromise);
      }, [] as Promise<any>[]),
    ];

    const hasAsyncValidations = promises.length > 0;
    const asyncValidationPromiseKey = ++nextAsyncValidationKey;
    const promise = Promise.all(promises).then(
      clearAsyncValidationPromise(asyncValidationPromiseKey),
    );

    // backwards-compat: add promise to submit-blocking promises iff there are any promises to await
    if (hasAsyncValidations) {
      asyncValidationPromises[asyncValidationPromiseKey] = promise;
    }

    const processErrors = (afterAsync: boolean) => {
      let merged = {
        ...(limitedFieldLevelValidation ? formState.errors : {}),
        ...recordLevelErrors,
        ...(afterAsync
          ? asyncRecordLevelErrors // new async errors
          : formState.asyncErrors), // previous async errors
      };

      const forEachError = (fn: (name: string, error: any) => void) => {
        fieldKeys.forEach((name) => {
          if (fields[name]) {
            // make sure field is still registered
            // field-level errors take precedent over record-level errors
            const recordLevelError = getIn(recordLevelErrors, name);
            const errorFromParent = getIn(merged, name);
            const hasFieldLevelValidation = getValidators(
              safeFields[name],
            ).length;
            const fieldLevelError = fieldLevelErrors[name];
            fn(
              name,
              (hasFieldLevelValidation && fieldLevelError) ||
                (validate && recordLevelError) ||
                (!recordLevelError && !limitedFieldLevelValidation
                  ? errorFromParent
                  : undefined),
            );
          }
        });
      };

      forEachError((name, error) => {
        merged = setIn(merged, name, error) || {};
      });

      forEachError((name, error) => {
        if (error && error[ARRAY_ERROR]) {
          const existing = getIn(merged, name);
          const copy: any = [...existing];
          copy[ARRAY_ERROR] = error[ARRAY_ERROR];
          merged = setIn(merged, name, copy);
        }
      });

      if (!shallowEqual(formState.errors, merged)) {
        formState.errors = merged;
      }
      if (afterAsync) {
        formState.asyncErrors = asyncRecordLevelErrors;
      }
      formState.error = recordLevelErrors[FORM_ERROR];
    };

    if (hasAsyncValidations) {
      // async validations are running, ensure validating is true before notifying
      state.formState.validating++;
      callback();
    }

    // process sync errors
    processErrors(false);
    // sync errors have been set. notify listeners while we wait for others
    callback();

    if (hasAsyncValidations) {
      const afterPromise = () => {
        state.formState.validating--;
        callback();
        // field async validation may affect formState validating
        // so force notifyFormListeners if validating is still 0 after callback finished
        // and lastFormState validating is true
        if (
          state.formState.validating === 0 &&
          state.lastFormState!.validating
        ) {
          notifyFormListeners();
        }
      };

      promise
        .then(() => {
          if (nextAsyncValidationKey > asyncValidationPromiseKey) {
            // if this async validator has been superseded by another, ignore its results
            return;
          }

          processErrors(true);
        })
        .then(afterPromise, afterPromise);
    }
  };

  const notifyFieldListeners = (name?: string | null | undefined) => {
    if (inBatch) {
      return;
    }
    const { fields, fieldSubscribers, formState } = state;
    const safeFields = { ...fields };
    const notifyField = (fieldName: string) => {
      const field = safeFields[fieldName];
      const fieldState = publishFieldState(formState, field);

      const { lastFieldState } = field;
      field.lastFieldState = fieldState;

      const fieldSubscriber = fieldSubscribers[fieldName];
      if (fieldSubscriber) {
        notify(
          fieldSubscriber,
          fieldState,
          lastFieldState,
          filterFieldState as StateFilter<FieldState<any>>,
          lastFieldState === undefined,
        );
      }
    };
    if (name) {
      notifyField(name);
    } else {
      Object.keys(safeFields).forEach(notifyField);
    }
  };

  const markAllFieldsTouched = (): void => {
    Object.keys(state.fields).forEach((key) => {
      state.fields[key].touched = true;
    });
  };

  const hasSyncErrors = () =>
    !!(state.formState.error || hasAnyError(state.formState.errors!));

  const calculateNextFormState = (): FormState<FormValues> => {
    const { fields, formState, lastFormState } = state;
    const safeFields = { ...fields };
    const safeFieldKeys = Object.keys(safeFields);

    type FieldKey = string | keyof FormValues;

    type FormFieldsDirtyState = Partial<Record<FieldKey, true>>;
    type FormFieldsBooleanState = Partial<Record<FieldKey, boolean>>;

    // calculate dirty/pristine
    let foundDirty = false;
    const dirtyFields = safeFieldKeys.reduce((result, key) => {
      const dirty = !safeFields[key].isEqual(
        getIn(formState.values, key),
        getIn(formState.initialValues || {}, key),
      );

      if (dirty) {
        foundDirty = true;
        result[key as FieldKey] = true;
      }

      return result;
    }, {} as FormFieldsDirtyState);

    const dirtyFieldsSinceLastSubmit = safeFieldKeys.reduce((result, key) => {
      const nonNullLastSubmittedValues = formState.lastSubmittedValues || {}; // || {} is for flow, but causes branch coverage complaint

      if (
        !safeFields[key].isEqual(
          getIn(formState.values, key),
          getIn(nonNullLastSubmittedValues, key),
        )
      ) {
        result[key as FieldKey] = true;
      }

      return result;
    }, {} as FormFieldsDirtyState);

    formState.pristine = !foundDirty;
    formState.dirtySinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      Object.values(dirtyFieldsSinceLastSubmit).some((value) => value)
    );
    formState.modifiedSinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      // Object.values would treat values as mixed (facebook/flow#2221)
      Object.keys(safeFields).some(
        (value) => safeFields[value].modifiedSinceLastSubmit,
      )
    );

    formState.valid =
      !formState.error &&
      !formState.submitError &&
      !hasAnyError(formState.errors!) &&
      !(formState.submitErrors && hasAnyError(formState.submitErrors));

    const nextFormState = convertToExternalFormState(formState);

    const { modified, touched, visited } = safeFieldKeys.reduce(
      (result, key) => {
        result.modified[key as FieldKey] = safeFields[key].modified;
        result.touched[key as FieldKey] = safeFields[key].touched;
        result.visited[key as FieldKey] = safeFields[key].visited;

        return result;
      },
      {
        modified: {} as FormFieldsBooleanState,
        touched: {} as FormFieldsBooleanState,
        visited: {} as FormFieldsBooleanState,
      },
    );

    nextFormState.dirtyFields =
      lastFormState && shallowEqual(lastFormState.dirtyFields, dirtyFields)
        ? lastFormState.dirtyFields
        : dirtyFields;
    nextFormState.dirtyFieldsSinceLastSubmit =
      lastFormState &&
      shallowEqual(
        lastFormState.dirtyFieldsSinceLastSubmit,
        dirtyFieldsSinceLastSubmit,
      )
        ? lastFormState.dirtyFieldsSinceLastSubmit
        : dirtyFieldsSinceLastSubmit;
    nextFormState.modified =
      lastFormState && shallowEqual(lastFormState.modified, modified)
        ? lastFormState.modified
        : modified;
    nextFormState.touched =
      lastFormState && shallowEqual(lastFormState.touched, touched)
        ? lastFormState.touched
        : touched;
    nextFormState.visited =
      lastFormState && shallowEqual(lastFormState.visited, visited)
        ? lastFormState.visited
        : visited;

    return lastFormState && shallowEqual(lastFormState, nextFormState)
      ? lastFormState
      : nextFormState;
  };

  const callDebug = () =>
    debug &&
    process.env.NODE_ENV !== "production" &&
    debug(
      calculateNextFormState(),
      Object.keys(state.fields).reduce((result, key: string) => {
        result[key] = state.fields[key];
        return result;
      }, {} as typeof state.fields),
    );

  let notifying: boolean = false;
  let scheduleNotification: boolean = false;

  const notifyFormListeners = () => {
    if (notifying) {
      scheduleNotification = true;
    } else {
      notifying = true;
      callDebug();

      if (
        !inBatch &&
        !(validationPaused && preventNotificationWhileValidationPaused)
      ) {
        const { lastFormState } = state;
        const nextFormState = calculateNextFormState();
        if (nextFormState !== lastFormState) {
          state.lastFormState = nextFormState;
          notify(
            state.subscribers,
            nextFormState,
            lastFormState,
            filterFormState,
          );
        }
      }

      notifying = false;

      if (scheduleNotification) {
        scheduleNotification = false;
        notifyFormListeners();
      }
    }
  };

  const beforeSubmit = (): boolean =>
    Object.keys(state.fields).some(
      (name) =>
        // @ts-ignore
        state.fields[name].beforeSubmit &&
        // @ts-ignore
        state.fields[name].beforeSubmit() === false,
    );

  const afterSubmit = (): void =>
    Object.keys(state.fields).forEach(
      (name) =>
        // @ts-ignore
        state.fields[name].afterSubmit && state.fields[name].afterSubmit(),
    );

  const resetModifiedAfterSubmit = (): void =>
    Object.keys(state.fields).forEach(
      (key) => (state.fields[key].modifiedSinceLastSubmit = false),
    );

  // generate initial errors
  runValidation(undefined, () => {
    notifyFormListeners();
  });

  const api: FormApi<FormValues> = {
    batch: (fn: () => void) => {
      inBatch++;
      fn();
      inBatch--;
      notifyFieldListeners();
      notifyFormListeners();
    },

    blur: (name: string) => {
      const { fields, formState } = state;
      const previous = fields[name];
      if (previous) {
        // can only blur registered fields
        delete formState.active;
        fields[name] = {
          ...previous,
          active: false,
          touched: true,
        };
        if (validateOnBlur) {
          runValidation(name, () => {
            notifyFieldListeners();
            notifyFormListeners();
          });
        } else {
          notifyFieldListeners();
          notifyFormListeners();
        }
      }
    },

    change: (name: string & keyof FormValues, value: any) => {
      const { fields, formState } = state;
      if (getIn(formState.values, name) !== value) {
        changeValue(state, name, () => value);
        const previous = fields[name];
        if (previous) {
          // only track modified for registered fields
          fields[name] = {
            ...previous,
            modified: true,
            modifiedSinceLastSubmit: !!formState.lastSubmittedValues,
          };
        }
        if (validateOnBlur) {
          notifyFieldListeners();
          notifyFormListeners();
        } else {
          runValidation(name, () => {
            notifyFieldListeners();
            notifyFormListeners();
          });
        }
      }
    },

    get destroyOnUnregister() {
      return !!destroyOnUnregister;
    },

    set destroyOnUnregister(value: boolean) {
      destroyOnUnregister = value;
    },

    focus: (name: string) => {
      const field = state.fields[name];
      if (field && !field.active) {
        state.formState.active = name;
        field.active = true;
        field.visited = true;
        notifyFieldListeners();
        notifyFormListeners();
      }
    },

    mutators: mutatorsApi,

    getFieldState: ((name: string) => {
      const field = state.fields[name];
      return field && field.lastFieldState;
    }) as GetFieldState<FormValues>,

    getRegisteredFields: () => Object.keys(state.fields),

    getState: () => calculateNextFormState(),

    initialize: (
      data:
        | InitialFormValues<FormValues>
        | ((values: FormValues) => InitialFormValues<FormValues>),
    ) => {
      const { fields, formState } = state;
      const safeFields = { ...fields };

      const values: InitialFormValues<FormValues> =
        typeof data === "function" ? data(formState.values) : data;

      if (!keepDirtyOnReinitialize) {
        formState.values = values as unknown as FormValues;
      }
      /**
       * Hello, inquisitive code reader! Thanks for taking the time to dig in!
       *
       * The following code is the way it is to allow for non-registered deep
       * field values to be set via initialize()
       */

      // save dirty values
      const savedDirtyValues: Partial<FormValues> = keepDirtyOnReinitialize
        ? Object.keys(safeFields).reduce((result, key) => {
            const field = safeFields[key];
            const pristine = field.isEqual(
              getIn(formState.values, key),
              getIn(formState.initialValues || {}, key),
            );
            if (!pristine) {
              result[key as keyof FormValues] = getIn(formState.values, key);
            }
            return result;
          }, {} as Partial<FormValues>)
        : {};

      // update status
      formState.status = initialStatus;

      // update initialValues and values
      formState.initialValues = values;
      formState.values = values as unknown as FormValues;

      // restore the dirty values
      Object.keys(savedDirtyValues).forEach((key) => {
        formState.values =
          setIn(formState.values, key, savedDirtyValues[key]) || {};
      });
      runValidation(undefined, () => {
        notifyFieldListeners();
        notifyFormListeners();
      });
    },

    isValidationPaused: () => validationPaused,

    pauseValidation: (preventNotification: boolean = true) => {
      validationPaused = true;
      preventNotificationWhileValidationPaused = preventNotification;
    },

    registerField: (
      name: string,
      subscriber: FieldSubscriber<any>,
      subscription: FieldSubscription = {},
      fieldConfig?: FieldConfig<any, FormValues>,
    ): Unsubscribe => {
      if (!state.fieldSubscribers[name]) {
        state.fieldSubscribers[name] = { index: 0, entries: {} };
      }
      const index = state.fieldSubscribers[name].index++;

      // save field subscriber callback
      state.fieldSubscribers[name].entries[index] = {
        subscriber: memoize(subscriber),
        subscription,
        notified: false,
      };

      // create initial field state if not exists
      const field = state.fields[name] || {
        active: false,
        afterSubmit: fieldConfig && fieldConfig.afterSubmit,
        beforeSubmit: fieldConfig && fieldConfig.beforeSubmit,
        data: (fieldConfig && fieldConfig.data) || {},
        isEqual: (fieldConfig && fieldConfig.isEqual) || tripleEquals,
        lastFieldState: undefined,
        modified: false,
        modifiedSinceLastSubmit: false,
        name,
        touched: false,
        valid: true,
        validateFields: fieldConfig && fieldConfig.validateFields,
        validators: {},
        validating: false,
        visited: false,
      };
      // Mutators can create a field in order to keep the field states
      // We must update this field when registerField is called afterwards
      field.blur = field.blur || (() => api.blur(name));
      field.change = field.change || ((value) => api.change(name, value));
      field.focus = field.focus || (() => api.focus(name));
      state.fields[name] = field;

      let haveValidator = false;

      const silent = fieldConfig && fieldConfig.silent;

      const notifyListeners = () => {
        if (silent && state.fields[name]) {
          notifyFieldListeners(name);
        } else {
          notifyFormListeners();
          notifyFieldListeners();
        }
      };

      if (fieldConfig) {
        haveValidator = !!(
          fieldConfig.getValidator && fieldConfig.getValidator()
        );

        if (fieldConfig.getValidator) {
          state.fields[name].validators[index] = fieldConfig.getValidator;
        }

        const noValueInFormState =
          getIn(state.formState.values, name) === undefined;

        if (
          fieldConfig.initialValue !== undefined &&
          (noValueInFormState ||
            // @ts-ignore
            getIn(state.formState.values, name) ===
              getIn(state.formState.initialValues, name))
          // only initialize if we don't yet have any value for this field
        ) {
          state.formState.initialValues = setIn(
            state.formState.initialValues ||
              ({} as InitialFormValues<FormValues>),
            name,
            fieldConfig.initialValue,
          );
          state.formState.values = setIn(
            state.formState.values,
            name,
            fieldConfig.initialValue,
          );
          runValidation(undefined, notifyListeners);
        }

        // only use defaultValue if we don't yet have any value for this field
        if (
          fieldConfig.defaultValue !== undefined &&
          fieldConfig.initialValue === undefined &&
          getIn(state.formState.initialValues, name) === undefined &&
          noValueInFormState
        ) {
          state.formState.values = setIn(
            state.formState.values,
            name,
            fieldConfig.defaultValue,
          );
        }
      }

      if (haveValidator) {
        runValidation(undefined, notifyListeners);
      } else {
        notifyListeners();
      }

      return () => {
        let validatorRemoved = false;
        if (state.fields[name]) {
          // state.fields[name] may have been removed by a mutator
          validatorRemoved = !!(
            state.fields[name].validators[index] &&
            state.fields[name].validators[index]()
          );

          delete state.fields[name].validators[index];
        }
        let hasFieldSubscribers = !!state.fieldSubscribers[name];
        if (hasFieldSubscribers) {
          // state.fieldSubscribers[name] may have been removed by a mutator
          delete state.fieldSubscribers[name].entries[index];
        }
        let lastOne =
          hasFieldSubscribers &&
          !Object.keys(state.fieldSubscribers[name].entries).length;
        if (lastOne) {
          delete state.fieldSubscribers[name];
          delete state.fields[name];
          if (validatorRemoved) {
            state.formState.errors =
              setIn(state.formState.errors!, name, undefined) || {};
          }
          if (destroyOnUnregister) {
            state.formState.values =
              setIn(state.formState.values, name, undefined, true) || {};
          }
        }
        if (!silent) {
          if (validatorRemoved) {
            runValidation(undefined, () => {
              notifyFormListeners();
              notifyFieldListeners();
            });
          } else if (lastOne) {
            // values or errors may have changed
            notifyFormListeners();
          }
        }
      };
    },

    reset: (newInitialValues = state.formState.initialValues) => {
      if (state.formState.submitting) {
        state.formState.resetWhileSubmitting = true;
      }
      state.formState.submitFailed = false;
      state.formState.submitSucceeded = false;

      delete state.formState.submitError;
      delete state.formState.submitErrors;
      delete state.formState.lastSubmittedValues;

      api.initialize(newInitialValues || ({} as InitialFormValues<FormValues>));
    },

    /**
     * Resets all field flags (e.g. touched, visited, etc.) to their initial state
     */
    resetFieldState: (name: string) => {
      state.fields[name] = {
        ...state.fields[name],
        ...{
          active: false,
          lastFieldState: undefined,
          modified: false,
          touched: false,
          valid: true,
          validating: false,
          visited: false,
        },
      };
      runValidation(undefined, () => {
        notifyFieldListeners();
        notifyFormListeners();
      });
    },

    /**
     * Returns the form to a clean slate; that is:
     * - Clear all values
     * - Resets all fields to their initial state
     */
    restart: (newInitialValues = state.formState.initialValues) => {
      api.batch(() => {
        for (const name in state.fields) {
          api.resetFieldState(name);
          state.fields[name] = {
            ...state.fields[name],
            ...{
              active: false,
              lastFieldState: undefined,
              modified: false,
              modifiedSinceLastSubmit: false,
              touched: false,
              valid: true,
              validating: false,
              visited: false,
            },
          };
        }
        api.reset(newInitialValues);
      });
    },

    resumeValidation: () => {
      validationPaused = false;
      preventNotificationWhileValidationPaused = false;
      if (validationBlocked) {
        // validation was attempted while it was paused, so run it now
        runValidation(undefined, () => {
          notifyFieldListeners();
          notifyFormListeners();
        });
      }
      validationBlocked = false;
    },

    setConfig: (name: string, value: any): void => {
      switch (name) {
        case "debug":
          debug = value;
          break;
        case "destroyOnUnregister":
          destroyOnUnregister = value;
          break;
        case "initialValues":
          api.initialize(value);
          break;
        case "keepDirtyOnReinitialize":
          keepDirtyOnReinitialize = value;
          break;
        case "mutators":
          mutatorsProp = value;
          if (value) {
            Object.keys(mutatorsApi).forEach((key) => {
              if (!(key in value)) {
                delete mutatorsApi[key];
              }
            });
            Object.keys(value).forEach((key) => {
              mutatorsApi[key] = getMutatorApi(key);
            });
          } else {
            Object.keys(mutatorsApi).forEach((key) => {
              delete mutatorsApi[key];
            });
          }
          break;
        case "onSubmit":
          onSubmit = value;
          break;
        case "validate":
          validate = value;
          runValidation(undefined, () => {
            notifyFieldListeners();
            notifyFormListeners();
          });
          break;
        case "validateOnBlur":
          validateOnBlur = value;
          break;
        default:
          throw new Error("Unrecognised option " + name);
      }
    },

    setStatus: (newStatus: typeof state.formState.status) => {
      const { formState } = state;

      formState.status = newStatus;
    },

    submit: () => {
      const { formState } = state;

      if (formState.submitting) {
        return;
      }

      delete formState.submitErrors;
      delete formState.submitError;
      formState.lastSubmittedValues = { ...formState.values };

      if (hasSyncErrors()) {
        markAllFieldsTouched();
        resetModifiedAfterSubmit();
        state.formState.submitFailed = true;
        notifyFormListeners();
        notifyFieldListeners();
        return; // no submit for you!!
      }

      const asyncValidationPromisesKeys = Object.keys(asyncValidationPromises);
      if (asyncValidationPromisesKeys.length) {
        // still waiting on async validation to complete...
        Promise.all(
          asyncValidationPromisesKeys.map(
            (key) => asyncValidationPromises[Number(key)],
          ),
          // eslint-disable-next-line no-console
        ).then(api.submit, console.error);
        return;
      }
      const submitIsBlocked = beforeSubmit();
      if (submitIsBlocked) {
        return;
      }

      let resolvePromise:
        | undefined
        | ((value: ValidationErrors | PromiseLike<ValidationErrors>) => void);

      let completeCalled = false;

      const complete = (errors?: ValidationErrors) => {
        formState.submitting = false;
        const { resetWhileSubmitting } = formState;
        if (resetWhileSubmitting) {
          formState.resetWhileSubmitting = false;
        }
        if (errors && hasAnyError(errors)) {
          formState.submitFailed = true;
          formState.submitSucceeded = false;
          formState.submitErrors = errors;
          formState.submitError = errors[FORM_ERROR];
          markAllFieldsTouched();
        } else {
          if (!resetWhileSubmitting) {
            formState.submitFailed = false;
            formState.submitSucceeded = true;
          }
          afterSubmit();
        }

        notifyFormListeners();
        notifyFieldListeners();

        completeCalled = true;

        if (resolvePromise) {
          resolvePromise(errors);
        }

        return errors;
      };

      formState.submitting = true;
      formState.submitFailed = false;
      formState.submitSucceeded = false;
      formState.lastSubmittedValues = { ...formState.values };
      resetModifiedAfterSubmit();

      // onSubmit is either sync, callback or async with a Promise
      const result = onSubmit(formState.values, api, complete);

      if (!completeCalled) {
        if (result && isPromise(result)) {
          // onSubmit is async with a Promise
          notifyFormListeners(); // let everyone know we are submitting
          notifyFieldListeners(); // notify fields also
          return result.then(complete, (error) => {
            complete();
            throw error;
          });
        } else if (onSubmit.length >= 3) {
          // must be async, so we should return a Promise
          notifyFormListeners(); // let everyone know we are submitting
          notifyFieldListeners(); // notify fields also

          return new Promise((resolve) => {
            resolvePromise = resolve;
          });
        } else {
          // onSubmit is sync
          complete(result as ValidationErrors);
        }
      }
    },

    subscribe: (
      subscriber: FormSubscriber<FormValues>,
      subscription: FormSubscription,
    ): Unsubscribe => {
      if (!subscriber) {
        throw new Error("No callback given.");
      }
      if (!subscription) {
        throw new Error(
          "No subscription provided. What values do you want to listen to?",
        );
      }

      const memoized = memoize(subscriber);
      const { subscribers } = state;
      const index = subscribers.index++;

      subscribers.entries[index] = {
        subscriber: memoized,
        subscription,
        notified: false,
      };

      const nextFormState = calculateNextFormState();

      notifySubscriber(
        memoized,
        subscription,
        nextFormState,
        nextFormState,
        filterFormState,
        true,
      );

      return () => {
        delete subscribers.entries[index];
      };
    },
  };

  return api;
}

export default createForm;
