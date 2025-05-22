# 🚚 Real-Time Order & Delivery System

A full-stack real-time order and delivery system built with Next.js, Socket.IO, and MongoDB. This application allows customers to place orders, delivery partners to accept and fulfill orders, and administrators to manage the entire process - all in real-time.

## 📋 Project Overview

This application is a complete end-to-end solution for food delivery or similar delivery services that require real-time tracking and updates. It features:

- **Multi-user roles**: Customers, Delivery Partners, and Administrators
- **Real-time updates** using WebSockets (Socket.IO)
- **Secure authentication** with NextAuth.js
- **Responsive UI** built with Tailwind CSS and Shadcn UI components
- **Scalable architecture** using Node.js clustering and Dockers
- **Rating system** for delivery experience
- **Order history** and status management

## 🏗️ System Architecture for websocket
<img src="public/socket-architecture.png">

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **Tailwind CSS v4** (Styling)
- **Shadcn UI** (Component Library)
- **Socket.IO Client** (WebSocket Communication)

### Backend
- **Node.js** (Runtime)
- **Next.js API Routes** (RESTful API)
- **Socket.IO** (Real-time Communication)
- **NextAuth.js** (Authentication)
- **JWT** (JSON Web Tokens)

### Database
- **MongoDB** (Primary Database)
- **Mongoose** (ORM for MongoDB)

### DevOps
- **Docker** (Containerization)
- **Nginx** (Reverse Proxy for Production)
- **Node.js Clustering** (Horizontal Scaling)

## 📁 Folder Structure

The project follows a clean and modular structure:

```
src/
├── app/                 # Next.js App Router (Pages)
│   ├── api/             # API Routes
│   ├── admin/           # Admin Panel
│   ├── customer/        # Customer Dashboard 
│   ├── delivery/        # Delivery Partner Dashboard
│   └── ...              # Other pages (login, register, etc.)
│
├── components/          # React Components
│   ├── admin/           # Admin-specific components
│   ├── customer/        # Customer-specific components
│   ├── ui/              # Reusable UI components (Shadcn)
│   └── ...              # Common components
│
├── lib/                 # Utility Libraries
│   ├── socket.ts        # Socket.IO Configuration
│   ├── connectDb.ts     # MongoDB Connection
│   └── ...              # Other utilities
│
├── models/              # MongoDB Models
│   ├── user.model.ts    # User Model
│   ├── order.model.ts   # Order Model
│   └── ...              # Other models
│
├── context/             # React Context Providers
│   └── SocketProvider.tsx  # Socket Context Provider
│
├── middleware.ts        # Next.js Middleware (Auth)
└── server.ts            # Custom Server with Socket.IO
```

## 🚀 Setup Instructions

### Local Development Setup

```powershell
# Clone the repository
git clone https://github.com/sahil1330/real-time-order-delivery-system.git
cd real-time-order-delivery-system

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
New-Item -Path ".env" -ItemType "file"

# Start websocket server with nextjs dev server
npm run server
```

### Local Development Setup

```powershell

# Build the nextjs App
npm run build

# Create .env file (see Environment Variables section)
New-Item -Path ".env" -ItemType "file"

# Start websocket server with nextjs dev server
npm start
```

### Docker Deployment

```powershell
# Build and start the containers
docker-compose up -d

# View container logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Application
NODE_ENV=production
PORT=3000

# Authentication
AUTH_SECRET=your-auth-secret // run npx auth secret
AUTH_TRUST_HOST=true // for trusting host in production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database // enter your mongodb local setup or atlas uri

# Google OAuth (optional if you want google sign-in)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Email (for verification)
RESEND_API_KEY=your-resend-api-key
```

## 🌐 Hosting & Deployment Steps

### 1. Prepare Server

```powershell
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install docker.io docker-compose -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Deploy Application

```powershell
# Clone repository
git clone https://github.com/sahil1330/real-time-order-delivery-system.git
cd real-time-order-delivery-system

# Create environment files
cp .env.example .env
# Edit .env with production values

# Start application in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configure Nginx (SSL)

```powershell
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📡 WebSocket Flow Explanation

The real-time functionality works as follows:

1. **Connection**: Clients (customers, delivery partners, admin) connect to the Socket.IO server when logging in
2. **Room Joining**: 
   - Customers join their order-specific room (`order-{orderId}`)
   - Delivery partners join the delivery partner room (`delivery`) and their orders room (`order-{orderId}`)
   - Admins join the admin room (`admin`)

3. **Event Flow**:
   - Order Created: `new-order` event is emitted to admins and all delivery partners
   - Order Accepted: `order-accepted` event is emitted to the specific customer and admin
   - Update Order Status: `update-order` event is emitted by delivery partner to send updated order details to customer and admins.
   - Order Status Updated: `order-status-updated` event is emitted to the specific customer and admin

```
Client (Browser) → Socket.IO Client → Socket.IO Server → MongoDB
      ↑                                       ↓
      └───────────────────────────────────────┘
                  Real-time updates
```

## 📈 Scaling Plan

### Redis Adapter for Socket.IO

For handling multiple Socket.IO instances:

```javascript
// server.ts modifications
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

// Create Redis clients
const pubClient = createClient({ url: "redis://redis:6379" });
const subClient = pubClient.duplicate();

// Setup adapter
io.adapter(createAdapter(pubClient, subClient));
```

Add to `docker-compose.prod.yml`:

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
```

### Horizontal Scaling with Load Balancer

1. **Modify Docker Compose for scaling**:

```yaml
app:
  build:
    context: .
  deploy:
    replicas: 4
  environment:
    - SINGLE_PROCESS_MODE=true
```

2. **Add Load Balancer (Nginx)**:

```nginx
upstream app_servers {
    server app:3000;
    server app:3001;
    server app:3002;
    server app:3003;
    sticky cookie srv_id expires=1h domain=.example.com path=/;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🚀 Future Improvements

1. **Split Frontend/Backend**: It is better to seperate the backend with websocket server from nextjs and creating a different express backend as socket.io server with nextjs comes with their own set of challenges.
1. **Mobile Applications**: Develop native mobile apps using React Native for customers and delivery partners.
2. **Payment Gateway Integration**: Add support for multiple payment methods using payment gateway like Razorpay or Stripe.
3. **Analytics Dashboard**: Implement detailed analytics for business intelligence in each user's dashboard.
4. **Machine Learning**: Add order forecasting and smart delivery partner assignment
5. **Microservices Architecture**: Split the application into microservices for better scalability
6. **Internationalization**: Add support for multiple languages and currencies
7. **Offline Support**: Implement PWA features for limited offline functionality
8. **Performance Optimization**: Implement server-side caching and database indexing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

- Your Name - [GitHub Profile](https://github.com/sahil1330)

---

Made with ❤️ using Next.js, Socket.IO and MongoDB
