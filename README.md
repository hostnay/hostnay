# Hostnay (Static Site)

This is a pure static HTML/CSS site for Hostnay. No backend, no database, no authentication.

## Structure
- `index.html` - main site
- `assets/css/styles.css` - styles
- `assets/js/app.js` - animations + maintenance toggles
- `assets/images/` - logos and team photos

## Update Logo
Replace the file:
```
assets/images/logo.svg
```

## Update Team Members
Edit the Team section in `index.html`:
```
<img class="team-avatar" src="assets/images/team-1.jpg" alt="Team member" />
<h3>Rana Al-Farsi</h3>
<p>Head of Infrastructure</p>
```
Add/remove cards and update the image filenames. Put your images in:
```
assets/images/
```

## Maintenance Toggle
Edit `assets/js/app.js`:
```
const maintenanceConfig = {
  vps: false,
  games: false,
  web: false,
  message: "Service temporarily unavailable"
};
```
Set any service to `true` to show maintenance state.

## Run locally
Open `index.html` in a browser.
