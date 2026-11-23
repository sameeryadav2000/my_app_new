# MobileLoom

A full-stack e-commerce site for buying smartphones (iPhone, Samsung, Xiaomi, Vivo). Users can browse phones by brand and model, pick storage, color and condition, add to cart, and check out with Stripe.

**Live site:** [mobileloom.vercel.app](https://mobileloom.vercel.app/home)

## Features

- **Product catalog**: browse by brand, then model, then a specific variant (storage, color, condition) with its own price and images
- **Cart**: add, update and remove items; the cart is saved to the user's account
- **Checkout**: shipping info form, then payment with Stripe (Payment Intents)
- **Orders**: order confirmation page and order history
- **Auth**: email/password sign-up with email verification, Google sign-in, forgot/reset password
- **Protected routes**: cart, shipping, payment, orders and account pages need a logged-in user (Next.js middleware)
- **Reviews**: users can leave reviews and ratings, with average rating shown per product
- **Recently viewed** products
- **Contact form** with email notifications through SendGrid
- **SEO**: page metadata, sitemap and robots.txt

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js API routes (Node.js) |
| Database | PostgreSQL with Prisma ORM |
| Auth | NextAuth.js (Credentials + Google), bcrypt password hashing |
| Payments | Stripe |
| Email | SendGrid |
| Hosting | Vercel |

## API Routes

All backend logic lives in `src/app/api/`:

| Route | What it does |
|---|---|
| `/api/auth/[...nextauth]` | NextAuth sign-in and session handling |
| `/api/auth/register` | Create an account and send a verification email |
| `/api/auth/verify_email` | Verify email from the link |
| `/api/auth/forgot_password`, `/api/auth/reset_password` | Password reset flow |
| `/api/phone`, `/api/phone_model`, `/api/phone_model_details` | Brands, models and product variants |
| `/api/model_image` | Product images |
| `/api/cart` | Get, add, update and remove cart items |
| `/api/shipping` | Save and load shipping info |
| `/api/create_payment_intent` | Create a Stripe payment intent for checkout |
| `/api/purchased` | Save and list completed orders |
| `/api/reviews`, `/api/average_rating` | Product reviews and ratings |
| `/api/contact` | Contact form |
| `/api/user/update_phone` | Update the user's phone number |

## Database

The Prisma schema (`prisma/schema.prisma`) includes these models:

- `Phone`, `PhoneModel` and `PhoneModelDetails` for the brand, model and variant hierarchy, plus `Color` and `ModelImage`
- `User`, `ShippingInfo`, `CartItem` and `PurchasedItem`
- `Review`
- `Seller` and `Admin`
- `VerificationToken` and `PasswordReset` for the auth flows
- `ContactMessage`

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted)
- Stripe, SendGrid, and Google OAuth credentials

### Setup

```bash
git clone https://github.com/sameeryadav2000/my_app_new.git
cd my_app_new
npm install
```

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mobileloom"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

SENDGRID_API_KEY=""
EMAIL_FROM=""
ADMIN_EMAIL=""
```

Set up the database and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000/home](http://localhost:3000/home).

To test payments, use Stripe's test card `4242 4242 4242 4242` with any future date and any CVC.

## Project Structure

```
├── lib/                  # Prisma client, NextAuth config, Stripe and SendGrid setup
├── prisma/               # Database schema
├── public/               # Product, homepage and slideshow images
└── src/
    ├── app/
    │   ├── api/          # Backend API routes
    │   ├── components/   # UI components (Navbar, CheckoutForm, ReviewList, ...)
    │   ├── home/         # Store pages (catalog, cart, shipping, payment, orders, account)
    │   └── login_signup/ # Login, sign-up, verification and password reset pages
    ├── context/          # Cart, loading and notification state
    ├── middleware.ts     # Protects logged-in routes
    └── utils/
```

## Author

**Sameer Yadav**: [GitHub](https://github.com/sameeryadav2000)
