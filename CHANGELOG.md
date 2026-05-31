# Job Tracker Lite - Changelog

### [0.3.3](https://github.com/gmaster0o0/job-tracker-lite-angular/compare/v0.3.1...v0.3.3) (2026-05-31)


### 🚀New Features

* **auth:** auth with  reset and verification ([3973c20](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/3973c20d63e1c1b5da0c5a24aac84030bd64a479)), closes [#51](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/51)
* **schemas:** add Zod validation with schemas ([6636d6c](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/6636d6c5dfdba47266dfdc846dc92f484223a894))
* **settings:** language selection ([#46](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/46)) ([483f543](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/483f543fd527d2e7060bbf6bbc2c17795459b96d)), closes [#24](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/24)
* **shared:** add server error alert component ([5395755](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/5395755baf750402b0644870872a06f69327ab10))

### [0.3.2](https://github.com/gmaster0o0/job-tracker-lite-angular/compare/v0.3.1...v0.3.2) (2026-05-13)


### 🚀New Features

* **language:**  transloco for language support and translations ([d0209d2](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/d0209d259b304140abbd6808e9b9f59b55098cec))
* **language:** add language selection and translation support ([6e74e21](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/6e74e2150ab9a6c41baa3c4f6ef0ab377497727c))
* **select:** add select component ([84aa707](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/84aa7073b79e02ce957807d06d5f9c1e65ac0239))
* **setting/language:** add language settings wtih transloco ([6cc6780](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/6cc6780cf7fde25a54164997b32a6940d08f3398))


### 🐞Bug Fixes

* **sync-version:** handle export const and object formats ([ae9e818](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/ae9e8184d4d6cac858b7883313e8c5fb77388de3))


### Build System and Versioning

* **package:** add @jsverse/transloco for language support ([146d25f](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/146d25fb8bc614a5a114b37e32c06277501e9c1f))

### [0.3.1](https://github.com/gmaster0o0/job-tracker-lite-angular/compare/v0.3.0...v0.3.1) (2026-05-12)


### 🐞Bug Fixes

* **db:** seeding bug ([#44](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/44)) ([f985e12](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/f985e12663a48a4b854e6441438e064c507bfdef))
* **jobs:** loading error and test improvements ([1369bc1](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/1369bc1de1dc34da086d7426734a6b29c2114d0a))


### 🚀New Features

* **home:** implement homepage with dynamic cards ([#32](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/32)) ([6e0ddd2](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/6e0ddd2cda8b6ef76bbfc9eb026ea569926c5ea2))
* **settings:** preference UI with theme changer ([8e48987](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/8e489871dc88df29cc30c74da7cbf28871829d89))
* **prisma:** PrismaClientExceptionFilter for error handling ([#36](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/36)) ([d9084b3](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/d9084b37424fa8b48a865817a4fa2159574c7845))

## 0.3.0 (2026-05-08)


### Bug Fixes

* **jobs:** onUpdated callback to contact dialogs for resource reload ([#12](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/12)) ([a5f217b](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/a5f217b8611e2e903c4008f97eef941c3e6dcb1e))
* **jobs:** tab scrolling and markdown rendering ([bb5a9e8](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/bb5a9e8471b067c87e00cfccf4a0cf3aa5813841)), closes [#13](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/13)


### New Features

* **api:** add prisma, db, and basic healthcheck ([942ec35](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/942ec356cdf946de0ef08ff8245288bdd2b1abcc))
* centralized testdata, mocking, and seeding data ([#8](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/8)) ([84b0a15](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/84b0a15d1b4e9f2b94f957553ea7998610254a2c))
* **contacts:** enhance contact list with scrolling ([#17](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/17)) ([1e083d0](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/1e083d087ffb0384c9d5e0d0955d41a99d96023c)), closes [#11](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/11)
* **frontend:** overhaul app layout/routing and add shared UI-based job navigation ([8168663](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/8168663da31202a1168c21d96e7a43510caba8b1))
* initialize  application ([1e9ad1e](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/1e9ad1ec19d8d9f23887ffd18f1e3f5590e638bd))
* **jobs:** add job list UI, jobs API CRUD, card components, lint + Husky ([3eca18d](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/3eca18da6d2962a8dcde752672da53686868018c))
* **jobs:** add tooltips for buttons and status indicators ([#16](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/16)) ([daada0c](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/daada0ca327d25953e2af2b1d590fafa694b3c09))
* **jobs:** add update and delete job functionality with dialogs ([086ffd5](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/086ffd5282e9c6503c2c2ceb863017804e51d52d))
* **jobs:** implement notes ([#18](https://github.com/gmaster0o0/job-tracker-lite-angular/issues/18)) ([92667ce](https://github.com/gmaster0o0/job-tracker-lite-angular/commit/92667cef6ea47e3b99d429125376d4fbbf49753f))
