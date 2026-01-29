# Local Website QA & Migration

## 1. Local QA Testing
- [x] **Public Pages Verification**
    - [x] Home Page (`/`)
    - [x] Results by Date (`/ket-qua-theo-ngay`)
    - [x] Statistics (`/thong-ke`, `/thong-ke/loto-gan`, etc.)
    - [x] Bac Nho Analysis (`/soi-cau-bac-nho`)
    - [x] News (`/tin-tuc`)
    - [x] Tools: Quay Thu (`/quay-thu`), Tao Dan (`/tao-dan-xo-so`)
- [x] **Functional Testing**
    - [x] Search functionality (Results by Date)
    - [x] Tool logic (Spin trial, Generate numbers)
- [x] **Admin Panel Verification**
    - [ ] Login (`/admin/login`)
    - [ ] Dashboard access
    - [ ] Data management (Results, Posts)

## 2. Migration to New VPS
- [x] Cleanup Current VPS (User instructed)
- [x] **Prepare Local Environment**
    - [x] Verify Local DB Schema (Fixed `views`)
    - [x] Verify Local Code (Fixed `route.ts`)
- [ ] **Package for New Deploy**
    - [ ] Create new `deploy_bundle.zip`
- [ ] **Deploy to New VPS**
    - [ ] Upload -> Install -> Build -> Start
