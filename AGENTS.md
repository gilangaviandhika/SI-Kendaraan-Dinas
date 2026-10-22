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
- Derive unique drivers and work areas from imported vehicle assignments; keep missing odometer and fuel-efficiency values null rather than inventing operational data.
- Give e-Overtime and e-SPPD distinct content routes, sharing the administrative form and service navigation to keep the mockup consistent.
- Administrative submissions remain local mockup state until persistence and authentication are explicitly requested; do not imply production approval or storage.
- Share fleet, trip, and editable master data through a root React provider so local mockup changes survive navigation without implying persistence.
- Give each master category a distinct child route under an Outlet layout so categories can be opened independently.
- Capture passenger and department at checkout and prefill check-in from the trip so identity is retained through the journey.
- Apply master edits through the fleet provider, synchronizing vehicle assignments and renamed plate trip references while retaining trip passenger/driver snapshots, so related records remain usable.
