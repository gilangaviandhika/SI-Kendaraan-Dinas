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

- Keep initial vehicle and trip fixtures in a browser-safe data module so the ready-state requirement can be tested without rendering routes.
- Give e-Overtime and e-SPPD distinct content routes, sharing the administrative form and service navigation to keep the mockup consistent.
- Administrative submissions remain local mockup state until persistence and authentication are explicitly requested; do not imply production approval or storage.
