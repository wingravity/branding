# Wingravity email signature

A Gmail-safe HTML signature for each person, built from the brand tokens:
round photo, name, title, tagline and social icons, a divider, then phone,
email and website, with the light wordmark closing that column.

```
npm run generate:signatures      # every data/*.local.json → out/<slug>.html + preview
node generate-signatures.mjs data/firstname-lastname.local.json   # one person
```

No dependencies to install. Rendering goes through the Chrome already on your
machine.

## One file per person

Personal details stay out of the repo. Each person has their own
`data/<slug>.local.json`, and their photo goes in `sources/photos/`. Both are
gitignored.

```
cp data/signature.example.json data/firstname-lastname.local.json   # then edit it
cp ~/photo.jpeg sources/photos/firstname-lastname.jpeg
```

Every local file renders. With none, the example renders so the layout can
still be checked.

| Field | Required | Notes |
| :--- | :--- | :--- |
| `name`, `title`, `email`, `website` | yes | |
| `nameSuffix` | no | Appended to the name in bold, e.g. `" - Founder"`. |
| `tagline` | no | One line under the title. |
| `phone` | no | Its row is left out when empty. |
| `photo` | no | Path to a source image, relative to this package. Cropped to a circle. |
| `photoPosition` | no | CSS `object-position` for the crop. Default `50% 50%`. |
| `photoUrl` | no | Use an already-hosted round photo instead of `photo`. |
| `socials` | no | `[{ "network", "url" }]`. Networks: `facebook`, `x`, `linkedin`, `instagram`. |
| `showWordmark` | no | `false` hides the wordmark under the contact rows. |
| `assetBaseUrl` | no | Where the images are hosted. Default `https://branding.wingravity.com/email`. |

Without a photo, the signature shows a `gray.200` disc with the person's
initials, and the generator prints a warning.

## Host the images first

Gmail fetches signature images from a public URL. A file path or an embedded
image gets stripped or sent as an attachment.

The generator writes every image into `docs/email/`, which GitHub Pages serves
at `https://branding.wingravity.com/email/`. The icons and wordmark are shared;
each person adds one photo, `<slug>-photo@2x.png`. Before pasting a signature:

1. Commit and push `docs/email/`.
2. Open `https://branding.wingravity.com/email/<slug>-photo@2x.png` in a
   browser and check it loads.

The photos are public once pushed, the same as in any email you send. Phone
numbers and other details stay in the gitignored `out/<slug>.html`.

## Install in Gmail

1. Open `out/<slug>.html` in Chrome.
2. Select all (⌘A) and copy (⌘C).
3. Gmail → Settings → **See all settings** → General → **Signature**.
4. Edit the existing signature, delete its contents, paste (⌘V).
5. Under **Signature defaults**, choose it for both **new emails** and
   **reply/forward**.
6. **Save changes** at the bottom of the page.

Replace every signature on the account with this one, so every email looks the
same.

## Choices, and why

| | |
| :--- | :--- |
| **Tables, inline styles** | Gmail strips `<style>` blocks, SVG, webfonts and `border-radius`. |
| **Photo pre-cut round** | Without `border-radius`, the only way to get a circle is a PNG with transparent corners. |
| **Icons as PNG** | Gmail drops SVG. Each icon is drawn as SVG here and rendered to a transparent PNG at 2x. |
| **`primaryInk` icons, dark links** | Mail is read on white, and `primary` teal is 1.68:1 there. Links are `gray.900`, underlined. |
| **Kanit, then Arial** | Kanit only shows where the reader has it installed. Arial is the realistic fallback. |
| **Transparent PNGs at 2x** | Sharp on retina. No white box in dark-mode Gmail. |

## Output

| File | What |
| :--- | :--- |
| `out/<slug>.html` | The signature to copy, with hosted image URLs. |
| `out/<slug>-preview.png` | A screenshot using local images, for review before hosting. |
| `docs/email/<slug>-photo@2x.png` | 192x192, shown at 96px. Transparent corners. |
| `docs/email/icon-{phone,email,website}@2x.png` | 32x32, shown at 16px. |
| `docs/email/icon-{facebook,x,linkedin,instagram}@2x.png` | 48x48, shown at 24px. |
| `docs/email/wordmark-on-light@2x.png` | 240x40, shown at 120px wide. |

Generation is deterministic. Re-running produces identical bytes.
