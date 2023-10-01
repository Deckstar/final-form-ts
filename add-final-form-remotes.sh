# Useful script for adding remotes for all the old libraries
#
# Note that we opt-out of fetching tags, so as not to cause conflicts and to
# keep our list of tags clean.

git remote add final-form git@github.com:final-form/final-form.git
git config remote.final-form.tagopt --no-tags


git remote add final-form-arrays git@github.com:final-form/final-form-arrays.git
git config remote.final-form-arrays.tagopt --no-tags


git remote add final-form-focus git@github.com:final-form/final-form-focus.git
git config remote.final-form-focus.tagopt --no-tags


git remote add react-final-form git@github.com:final-form/react-final-form.git
git config remote.react-final-form.tagopt --no-tags


git remote add react-final-form-arrays git@github.com:final-form/react-final-form-arrays.git
git config remote.react-final-form-arrays.tagopt --no-tags

