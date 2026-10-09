<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Identity text generation lives behind the IdentityGenerator type in src/lib/identity so a backend/AI provider can replace the local template generator later.
- Saved profiles go through the SavedProfilesStore interface in src/lib/identity/saved.ts (localStorage, versioned key) so a cloud store can replace it without touching generation or pages.
