# Nash site — React build

Vite + React 19 + Motion. Plain CSS with tokens, Poppins, the product's warm palette and the brand purple as the one accent.

```bash
cd web
npm install
npm run dev      # http://localhost:5173/nash-site/react/
npm run build    # writes ../react, which GitHub Pages serves at /nash-site/react/
```

Structure

```
src/
  App.jsx                    routes, the Tour / Try / Learn more mode, the sign-in prompt
  motion.js                  one motion vocabulary: ease, durations, popups
  data.js                    providers and models, connectors, sample chats, the asks
  styles/site.css            marketing styles carried over from the prototype
  styles/app.css             the Nash product UI, ported from Nash-main/client, scoped to .nashapp
  styles/tokens.css          colour on top: accent, wash, warm greys
  components/app/            NashApp (sidebar, composer), ModelPicker, Flyouts, Tour
  components/site/           SiteNav + ModeSwitch, SignInModal, HeroSequence, PricingBlock, Ticker, bits
  pages/                     Home (Tour/Try or Learn more), LearnMore, Security, Pricing, About
```

`?mode=try` or `?mode=site` on the URL opens straight into that mode.
