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

# Roadmap
## Supabase Setup
    - Storage
    - Db Setup
    - Hosting
## Develop Db Schema
### '/merchants' collection document object
```
const merchant = {
    id: v4(),
        // Random ID generator from package install

    merchantName: String,
        // eg. 'Hop Secret'

    merchantContactIds: Array,
        // Populated by merchant user IDs.
        // '/merchantUsers' Db collection will have more comprehensive data of admins for each merchant object.
        // eg. [ '<christhomasId>', '<kypedullaId>' ]

    address_components: Array,
        // Using Google's Autocomplete SDK, users enter input and upon selection,
        // Google will return comprehensive address data for each address field(ZIP, county, etc.)
        // This data is returned and set as array, as seen below.

    bookedEvents: Array,
        // Populated by event IDs from '/scheduledEvents'

    avgVendorRating: Number,
        // decimal score out of 5 based on completed events by vendors, who have since rated the merchant

    vendorComments: Map
        // Array of objects populated by associated comment objects from '/vendorComments'
}
```
### '/merchantUsers' collection document object
```
const merchantUser = {
    id: v4(),
    associatedMerchantId: String,
    isAdmin: Boolean,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    availableToContact: Boolean
}
```
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
## '/internalUsers' collection document object
```
const user = {
    id: v4(),
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
}
```


Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
