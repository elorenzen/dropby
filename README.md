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

# Roadmap
## firebase Setup
    - Storage
    - Db Setup
    - Hosting
## Develop Db Schema
```
// '/merchants' collection document object
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

    formatted_address: String,
    bookedEvents: Array,
        // Populated by event IDs from '/scheduledEvents'

    avgVendorRating: Number,
        // decimal score out of 5 based on completed events by vendors, who have since rated the merchant

    vendorComments: Map
        // Array of objects populated by associated comment objects from '/vendorComments'
}

// '/merchantUsers' collection document object
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

// ⚠️ TO-DO: // '/vendors' collection document object
// ⚠️ TO-DO: // '/vendorUsers' collection document object
// ⚠️ TO-DO: // '/scheduledEvents' + '/pastEvents' collections document object
// ⚠️ TO-DO: // '/internalUsers' collections document object
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
