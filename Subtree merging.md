# Subtree merging

## Sources:

- Nuclear squid blog: [Subtree merging and you](https://nuclearsquid.com/writings/subtree-merging-and-you/)
  - [Accessed 26 April 2023]
- StackOverflow question: [How do you merge two Git repositories?](https://stackoverflow.com/questions/1425892/how-do-you-merge-two-git-repositories)
  - [Accessed 26 April 2023]

## Commands:

Step 1: add remote for other repository

```bash
git remote add -f final-form git@github.com:final-form/final-form.git
```

Step 2: "merge" the repo without committing

```bash
git merge -s ours --allow-unrelated-histories --no-commit final-form/main
```

Step 3: point to where the repos files should be and put the remote files there

```bash
git read-tree --prefix=packages/final-form/ -u final-form/main
```

Step 4: manually commit changes

```bash
git commit -m "Merge Final Form into packages/final-form/"
```
