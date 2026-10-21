# NeonFitter Roadmap

Frontend-only ecommerce store (localStorage as db). Design system: dark neon showroom, Seiko/LUMIA ecommerce patterns.

## Done
- [x] Import repo engine: catalog, pricing, templates, canvas renderer, localStorage stores, design system, scene assets
- [x] Fix typecheck error in src/lib/neon/templates.ts (missing DesignElement import)
- [x] Add framer-motion dependency

## In progress
- [ ] App shell: header with promo bar/nav/cart badge, footer, font loading, root meta
- [ ] Home page (/)
- [ ] Create Your Sign editor (/editor) with undo/redo, live price, autosave
- [ ] Shop Designs (/shop) with category filter
- [ ] Product Details (/shop/$slug) with size selector
- [ ] Cart (/cart) with coupon NEON15, shipping rules
- [ ] Checkout (/checkout) guest, validation, duplicate-submit guard
- [ ] Order confirmation + tracking (/order/$orderId)
- [ ] Track Order (/track-order)
- [ ] Help & FAQs (/faq)
- [ ] How It Works (/how-it-works)
- [ ] Verify: typecheck, route flow via Playwright, add-to-cart to checkout journey
