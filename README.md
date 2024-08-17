# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

## Resources
    - https://nuxt.com/docs/getting-started/introduction
    - https://vuejs.org/guide/introduction.html
    - https://nuxt.com/modules/stripe-next
    - https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3#set-up-auth-component
    - https://supabase.nuxtjs.org/authentication

# Roadmap
## Supabase Setup
    - Storage
    - Db Setup
    - Hosting
## Develop Db Schema
## '/vendors' collection document object
```
const vendor = {
    id: v4(),
    vendorName: String,
    vendorContactIds: Array,
    bookedEvents: Array,
    avgMerchantRating: Number,
    merchantComments: Map
}
```
## '/vendorUsers' collection document object
```
const vendorUser = {
    id: v4(),
    associatedVendorId: String,
    isAdmin: Boolean,
    userType: String,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
}
```
## 'Event' document object
```
const event = {
    id: v4(),
    associatedVendorId: String,
    associatedMerchantId: String,
    estStart: Number, <-- JS timestamp
    estEnd: Number, <-- JS timestamp
    menuLink: String,
    menuList: Array,
    address_components: Array
}
```


Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
