# Changelog	

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [248.1.0](https://github.com/forcedotcom/commerce-on-lightning/compare/v242.1.1...248.1.0) (2023-09-11)


### Features

* Order Management is now supported through the plugin. See examples/som/README.md for more details!([903b7a9] https://github.com/forcedotcom/commerce-on-lightning/commit/903b7a9223b8c4dcca179a05aff774c642a23321)

* Digital Experience Bundle in Experience Cloud is now supported which means orgs that are higher than API version 59 can be used to create stores using the plugin ([4e866ed] https://github.com/forcedotcom/commerce-on-lightning/commit/4e866ed3b42c12da4e8e0a8f0869ad554507a774).

* New LWR order confirmation email flow ([b88ad9a] https://github.com/forcedotcom/commerce-on-lightning/commit/b88ad9ab15b99a907ebc5493b2d40b941bb7075b)

* Added support for iconURI, isApplication and description fields for extensions ([fce0fb0] https://github.com/forcedotcom/commerce-on-lightning/commit/fce0fb0def1b68e5bbd332758221cb8c41ef36a3).

* The example files have been updated to be move away from the ‘b2b-commerce-test’ Heroku app [40c6aba](https://github.com/forcedotcom/commerce-on-lightning/commit/40c6aba5d124f11336ba4256816d7c3d03a02fb4).

* updating stripe client side examples to latest ([#182](https://github.com/forcedotcom/commerce-on-lightning/issues/182)) ([6c73aff](https://github.com/forcedotcom/commerce-on-lightning/commit/6c73affbb8ece61e393d7c202930850f1e7f76fb))



## [242.1.1](https://github.com/forcedotcom/commerce-on-lightning/compare/v242.0.26...v242.1.1) (2023-02-08)



## [242.0.26](https://github.com/forcedotcom/commerce-on-lightning/compare/v240.0.49...v242.0.26) (2023-01-11)



## [240.0.49](https://github.com/forcedotcom/commerce-on-lightning/compare/v238.0.16...v240.0.49) (2022-10-10)


### Bug Fixes

* added check for nonexistantExtensionName ([7f50182](https://github.com/forcedotcom/commerce-on-lightning/commit/7f50182e303fc08dbf4d52cbcc4b654bc67730fb))
* added delete method for existing epn ([aa52d0c](https://github.com/forcedotcom/commerce-on-lightning/commit/aa52d0cd895cd8c2c38390a2e65adc8dee510df0))
* added delete method for existing epn ([a749468](https://github.com/forcedotcom/commerce-on-lightning/commit/a749468063dbfe506f0fe20f3d0efcd8c98b7638))
* added jsdoc comments ([e6a9b96](https://github.com/forcedotcom/commerce-on-lightning/commit/e6a9b96008555cb3d6e7bfd200c6b8e703f80979))
* added message for same store names ([a5fa36a](https://github.com/forcedotcom/commerce-on-lightning/commit/a5fa36a4ef9a2d5abaa6ca0dc0bf322d88d7d628))
* added try/catch ([818d2e0](https://github.com/forcedotcom/commerce-on-lightning/commit/818d2e0c50a141cf47aa609fb46e8232381c435c))
* added unit tests for invalid extension name ([86db9f3](https://github.com/forcedotcom/commerce-on-lightning/commit/86db9f3b1e3ea43e1053c1dd388df3042cb38757))
* addresses all comments ([87ad409](https://github.com/forcedotcom/commerce-on-lightning/commit/87ad409d0d0cc79ba4f0a4674d9527b8efb97f5b))
* appended original error messages ([5f1691b](https://github.com/forcedotcom/commerce-on-lightning/commit/5f1691baf77caed53dc73fba20a3b6f8b621316c))
* catch sfdx errors ([015a46b](https://github.com/forcedotcom/commerce-on-lightning/commit/015a46b32d3fa00249e9956e30c67a690416bab9))
* changes to prints ([65c8be7](https://github.com/forcedotcom/commerce-on-lightning/commit/65c8be77d85181157a263a382bbc2be38238780e))
* create user role if it does not exist ([8e6e552](https://github.com/forcedotcom/commerce-on-lightning/commit/8e6e55283180be19c4e1316955bb5c123d3ae400))
* create user role if it does not exist ([d55f507](https://github.com/forcedotcom/commerce-on-lightning/commit/d55f507a50d8339d82873b5400bd8f3af29bafba))
* messages ([69a8271](https://github.com/forcedotcom/commerce-on-lightning/commit/69a82717951cbd2900a4001258ba1f3b09b235cf))
* minor format adjustment ([947c011](https://github.com/forcedotcom/commerce-on-lightning/commit/947c01141b86b2cb1f1ecb3e2874176fc574747e))
* modified command.snapshot ([9806e5a](https://github.com/forcedotcom/commerce-on-lightning/commit/9806e5aabfce7c2fd59bab4bb46755613f467774))
* modified error for duplicate ([cac3a9a](https://github.com/forcedotcom/commerce-on-lightning/commit/cac3a9a0a4c6e050ff70826de2ebb0c2a83928bd))
* modified error messages ([ab93f9f](https://github.com/forcedotcom/commerce-on-lightning/commit/ab93f9fa654fa93c9e552b6039ff3d0698a58be5))
* modified json response ([631fa15](https://github.com/forcedotcom/commerce-on-lightning/commit/631fa154f777118162c64911782cbc66e47ea269))
* modified message ([74c1c08](https://github.com/forcedotcom/commerce-on-lightning/commit/74c1c085d3c4f122d61a68754cf83f41f1917061))
* modified messages ([7b6b15d](https://github.com/forcedotcom/commerce-on-lightning/commit/7b6b15df204983806b0461ac589e48016bc5b97f))
* modified README.md ([9f10762](https://github.com/forcedotcom/commerce-on-lightning/commit/9f10762fe824ede87db8800b5fcf2ce29bd73fb2))
* modified README.md ([7ac2ae4](https://github.com/forcedotcom/commerce-on-lightning/commit/7ac2ae46c95342379e763076d410d8d714488b07))
* modified register message ([4f648db](https://github.com/forcedotcom/commerce-on-lightning/commit/4f648db94eebc044ab7e7e53fd49799a381f959e))
* modified store.json ([f7e9956](https://github.com/forcedotcom/commerce-on-lightning/commit/f7e995603153cdc3e3b26b6ae7d1c3ac75afa437))
* modified success message ([d98baa3](https://github.com/forcedotcom/commerce-on-lightning/commit/d98baa33c6ecef2cac3d1a172ee31d21511bf26f))
* remove comments ([0aaf0d6](https://github.com/forcedotcom/commerce-on-lightning/commit/0aaf0d692b5fdba55459782c40938bed53bc7aff))
* removed extra log ([73e8efd](https://github.com/forcedotcom/commerce-on-lightning/commit/73e8efd7005efd1a854a98bee93a212f3cf14093))
* throw sfdx error for missing required flags ([5cdf5fd](https://github.com/forcedotcom/commerce-on-lightning/commit/5cdf5fd09a3c7c4fc3e1d9c441e36d1902b31ce9))
* updated snapshot ([64fd73b](https://github.com/forcedotcom/commerce-on-lightning/commit/64fd73b7d761944692004dc34344f9f4aa3c7bdd))
* upgrade @oclif/config from 1.17.0 to 1.18.3 ([#60](https://github.com/forcedotcom/commerce-on-lightning/issues/60)) ([f5f572e](https://github.com/forcedotcom/commerce-on-lightning/commit/f5f572e8f5390d4278bf2ba53004fa1649fa4ae2))
* upgrade fast-xml-parser from 3.19.0 to 3.21.1 ([#61](https://github.com/forcedotcom/commerce-on-lightning/issues/61)) ([dc4e3ed](https://github.com/forcedotcom/commerce-on-lightning/commit/dc4e3ed4190eed6a170cd477ad17b0063a782a96))
* upgrade tslib from 2.2.0 to 2.3.1 ([d0cccf2](https://github.com/forcedotcom/commerce-on-lightning/commit/d0cccf235202affa70536f843576e4fe740f20c5))
* upgrade yaml from 2.0.0-5 to 2.1.1 ([#97](https://github.com/forcedotcom/commerce-on-lightning/issues/97)) ([3692207](https://github.com/forcedotcom/commerce-on-lightning/commit/36922074659f1f78051fbdbf603dfc18190e16af))
* verified/signed flag ([7ffe7f6](https://github.com/forcedotcom/commerce-on-lightning/commit/7ffe7f6a8508ad12ac7e56e473dcfa006bf810fb))


### Features

* addressed comments ([0063c07](https://github.com/forcedotcom/commerce-on-lightning/commit/0063c07c12ecb6b70738725fa46ebe758a5537dc))
* language support ([8f20afc](https://github.com/forcedotcom/commerce-on-lightning/commit/8f20afc9c22952ed9f954b2e8aedb3dd7f7653c5))
* language support ([2f7743a](https://github.com/forcedotcom/commerce-on-lightning/commit/2f7743ae011feb987a8d6d3d416e00d341d0da6f))
* map command implementation ([4dac0d9](https://github.com/forcedotcom/commerce-on-lightning/commit/4dac0d92fb0a39342d2f334be8f78d78f7b2e17e))
* support large carts ([67122fc](https://github.com/forcedotcom/commerce-on-lightning/commit/67122fc29dd72ae2d8d683ab049ed590727f7a67))
* update version for next release ([777ef4d](https://github.com/forcedotcom/commerce-on-lightning/commit/777ef4db82dd3a364f10a764a90c2764f0a4fc3e))



## [238.0.16](https://github.com/forcedotcom/commerce-on-lightning/compare/v238.0.15...v238.0.16) (2022-09-29)


### Bug Fixes

* apex tests ([6db2e27](https://github.com/forcedotcom/commerce-on-lightning/commit/6db2e27822a5cf2af9b939dda39be1424087a110))



## [238.0.15](https://github.com/forcedotcom/commerce-on-lightning/compare/v236.0.3...v238.0.15) (2022-05-19)


### Bug Fixes

* allow edited files to persist and setting to correct version number ([f8f569c](https://github.com/forcedotcom/commerce-on-lightning/commit/f8f569cdd775d62817f742a8650df609c38931eb))
* allow edited files to persist as a command instead of hook ([2d1502b](https://github.com/forcedotcom/commerce-on-lightning/commit/2d1502b30708d3f54c6073959ecb3d08a7220bff))
* change the timeout from unlimited to 60mins ([1de4e0a](https://github.com/forcedotcom/commerce-on-lightning/commit/1de4e0a5a38384d29d068cad423cc82e65d1c400))
* Correct typo on Payeezy adapter ([6bcfc36](https://github.com/forcedotcom/commerce-on-lightning/commit/6bcfc3625bd048bd89113abc00251958de817d01))
* do NOT backup existing example files ([a9947f8](https://github.com/forcedotcom/commerce-on-lightning/commit/a9947f884a2614ee157e0c8c22b63b7eda255a4e))
* ignore parsing of node value ([220da2a](https://github.com/forcedotcom/commerce-on-lightning/commit/220da2afb4bc278d65e8f35caec81c91950464b4))
* move test-ts-update circleci to develop ([bc968db](https://github.com/forcedotcom/commerce-on-lightning/commit/bc968db6682b9cb8e0f76842241e5fff2efe7de5))
* regenerating command snapshot after rebasing main to develop ([b22b291](https://github.com/forcedotcom/commerce-on-lightning/commit/b22b2911b37455268aa7893013987991d2ec31bd))
* resolving merge conflicts with main ([d4b0c62](https://github.com/forcedotcom/commerce-on-lightning/commit/d4b0c62ab34d2b9573b81689f3532ad34a989765))
* revert changes made to existing global variables ([d7acfa4](https://github.com/forcedotcom/commerce-on-lightning/commit/d7acfa40333306bf901fd142c39aafbbe14b5059))
* stripe payment gateway ([926b717](https://github.com/forcedotcom/commerce-on-lightning/commit/926b717ccf732d70c07a6b9913b8e8030b570be8))
* update old references to main-2 ([bb63ab7](https://github.com/forcedotcom/commerce-on-lightning/commit/bb63ab7a4b9a433bab3705af8cf709e875fa1f34))


### Features

* **cleanup:** add contributing.md update contributing.md moving development code to develop branch ([63123ee](https://github.com/forcedotcom/commerce-on-lightning/commit/63123ee24aca5fbebf22ff993c4c69df6705f3d1))
* enable translation workbench ([8e89fba](https://github.com/forcedotcom/commerce-on-lightning/commit/8e89fba665a5bd173510a1e0c6bbeadca8c7b9f9))
* i18n support for tax integration sample ([a0e7a6e](https://github.com/forcedotcom/commerce-on-lightning/commit/a0e7a6ec02309f5d998853459dce8ca297eca77c))
* support net and gross taxation with adjustments ([748e692](https://github.com/forcedotcom/commerce-on-lightning/commit/748e69266069d844038edc92536a076bcf545bfb))



## [236.0.3](https://github.com/forcedotcom/commerce-on-lightning/compare/v234.0.17...v236.0.3) (2022-04-26)


### Bug Fixes

* add release context to config.yml ([10646cc](https://github.com/forcedotcom/commerce-on-lightning/commit/10646cc5e0c210e26b7a69fc4b04998c85bdd16b))
* alter release to salesforce-cli context in config.yml ([b6b6c16](https://github.com/forcedotcom/commerce-on-lightning/commit/b6b6c16357c674d064713d961fc320e242198ca3))
* change main-2 to master and fix config.yml ([f3e1cf4](https://github.com/forcedotcom/commerce-on-lightning/commit/f3e1cf4fe32c9a301cbe94c0eb00b3d5e07b4c77))
* update README.md ([bcd79aa](https://github.com/forcedotcom/commerce-on-lightning/commit/bcd79aad70daa15b8cba575eaf8c2397e2b90fb2))



## [234.0.17](https://github.com/forcedotcom/commerce-on-lightning/compare/v234.0.15...v234.0.17) (2022-01-19)


### Bug Fixes

* correct typo ([7485e55](https://github.com/forcedotcom/commerce-on-lightning/commit/7485e55f6012bc8926b0e1691bd3ba090f70a695))
* removing /s from store url ([ccf364d](https://github.com/forcedotcom/commerce-on-lightning/commit/ccf364d237219b5bbfa6db547bf453cf5ff39087))
* removing /s from store url ([40e1b92](https://github.com/forcedotcom/commerce-on-lightning/commit/40e1b925fa85db36a1ff1b1e708b6492cfd962c1))
* update product import CSVs to expected v54 format ([8c17c13](https://github.com/forcedotcom/commerce-on-lightning/commit/8c17c13fd8bfe4068dca33bb6f146f1eb8312847))



## [234.0.15](https://github.com/forcedotcom/commerce-on-lightning/compare/v234.0.14...v234.0.15) (2022-01-13)



## [234.0.14](https://github.com/forcedotcom/commerce-on-lightning/compare/v232.1.0...v234.0.14) (2022-01-07)


### Bug Fixes

* adding new order confirmation eamil flow changes ([26731c2](https://github.com/forcedotcom/commerce-on-lightning/commit/26731c2c39edaac0c11dd74ac90447588feaa5ef))
* change readme to private repo readme ([5dbfa45](https://github.com/forcedotcom/commerce-on-lightning/commit/5dbfa45d496a3de2b65f2ac7b0a3a10138e44024))
* circular dependencies ([fd766a0](https://github.com/forcedotcom/commerce-on-lightning/commit/fd766a0bc6b134fd38418b8dda2c69023f82554a))
* circular dependencies ([fa36b5e](https://github.com/forcedotcom/commerce-on-lightning/commit/fa36b5e81ac3f9057565a5010e69df519a5c6ddb))
* ensure npm circleci is updated ([ec3e2ad](https://github.com/forcedotcom/commerce-on-lightning/commit/ec3e2adc1aa2a771ccd2f6d419ca7f3d807ec9ef))
* ing a dumb circular dependency ([62f2e03](https://github.com/forcedotcom/commerce-on-lightning/commit/62f2e0393219a3498dc44963e331f203275ab350))
* ing a dumb circular dependency ([92ded34](https://github.com/forcedotcom/commerce-on-lightning/commit/92ded34e44d0e366db54f2531de44f848f59dfa1))
* ing a dumb circular dependency ([45ad1b5](https://github.com/forcedotcom/commerce-on-lightning/commit/45ad1b5f187731c70114cd9354260bfee8e1b698))
* ing template for b2b ([1dc50b6](https://github.com/forcedotcom/commerce-on-lightning/commit/1dc50b69a53f8b9a4c1579133ce93c4988b7b9dd))
* ing template for b2b ([f722bcd](https://github.com/forcedotcom/commerce-on-lightning/commit/f722bcd1bafbea5fe9d03f7883c4223495298ebf))
* orderconfirmationemail ([cea87a9](https://github.com/forcedotcom/commerce-on-lightning/commit/cea87a93a4122ffaa96e4fa06c2429a9b20137eb))
* payments needs store name and remove sharing rules ([13cf602](https://github.com/forcedotcom/commerce-on-lightning/commit/13cf602e584559ad5f35f0a5091c332cce18243f))
* payments needs store name and remove sharing rules ([a861b92](https://github.com/forcedotcom/commerce-on-lightning/commit/a861b925f469e8fefeb9808b2df36233c38edefb))
* prepare doesnt work from git ([2ad8a4d](https://github.com/forcedotcom/commerce-on-lightning/commit/2ad8a4d5a852e381adcc172b46730fa46b6b36ce))
* removing sharing rules ([99b62f5](https://github.com/forcedotcom/commerce-on-lightning/commit/99b62f533af2d131e517d05f959d2d31a2f69d0b))
* trying to figure out where undefined came from ([f55a555](https://github.com/forcedotcom/commerce-on-lightning/commit/f55a5550b0a5553e3d76233e6f1dffdc756d1199))
* update readme ([c1162c1](https://github.com/forcedotcom/commerce-on-lightning/commit/c1162c1249fb4cb71328387d9ee058b1db1a36c9))


### Features

* add b2b winter22 changes ([63310a2](https://github.com/forcedotcom/commerce-on-lightning/commit/63310a23aac538d065760f05d95cfb4faf3688c0))
* add b2b winter22 changes ([e73d923](https://github.com/forcedotcom/commerce-on-lightning/commit/e73d923c5be3bccdd35c252b5f286a6975bbc0ff))
* add property to inform CSP Level ([61a4514](https://github.com/forcedotcom/commerce-on-lightning/commit/61a4514061c82b506aa3e6b0406e920efc4e2975))
* add winter22 changes ([7631a4c](https://github.com/forcedotcom/commerce-on-lightning/commit/7631a4ceb5769a07aedeb02b440af826e7c5ccba))
* updating readme ([c463138](https://github.com/forcedotcom/commerce-on-lightning/commit/c4631386955f065bc53e56f8a1f2ebb9ef6b8c86))
* updating readme ([ac95d22](https://github.com/forcedotcom/commerce-on-lightning/commit/ac95d22e372cb1e78fd62a872926f952ac4c0da1))


### Reverts

* remove csp relaxing ([63d6e98](https://github.com/forcedotcom/commerce-on-lightning/commit/63d6e98789e712531064338052fa9edfefc1f3a8))



# [232.1.0](https://github.com/forcedotcom/commerce-on-lightning/compare/v232.0.2...v232.1.0) (2021-09-10)


### Features

* add in B2B checkout ([e6122cc](https://github.com/forcedotcom/commerce-on-lightning/commit/e6122cccaf22e3e2e0489334bee7a9757d385f3d))
* add in B2B checkout changes ([7a10e76](https://github.com/forcedotcom/commerce-on-lightning/commit/7a10e76cb9c42771791638c3edc4d689ffd478da))
* add in changes for 232 ([c8f3cff](https://github.com/forcedotcom/commerce-on-lightning/commit/c8f3cff1927d4f502442a3017bd2f53348fa43fd))



## [232.0.2](https://github.com/forcedotcom/commerce-on-lightning/compare/v232.0.1...v232.0.2) (2021-08-04)


### Bug Fixes

* formatting ([1e81d6b](https://github.com/forcedotcom/commerce-on-lightning/commit/1e81d6b629ef05034abc0cca0af8581a36f328f5))


### Features

* add property to inform CSP level ([fd430be](https://github.com/forcedotcom/commerce-on-lightning/commit/fd430be5365b15d2e9d0114373c665f667bd5ccf))
* add property to inform CSP Level ([25907b5](https://github.com/forcedotcom/commerce-on-lightning/commit/25907b50754496742048d96ff11104bbee550322))



## [232.0.1](https://github.com/forcedotcom/commerce-on-lightning/compare/v0.1.5...v232.0.1) (2021-07-09)


### Bug Fixes

* fixing properties_1.CONFIG_DIR not a fucntion ([4f0e567](https://github.com/forcedotcom/commerce-on-lightning/commit/4f0e567a92e0717288dca1b3f187388764aa52fe))
* fixing properties_1.CONFIG_DIR not a fucntion ([6a2e761](https://github.com/forcedotcom/commerce-on-lightning/commit/6a2e761fb515e4773f25be175dec3f1a6f07145e))



## [0.1.5](https://github.com/forcedotcom/commerce-on-lightning/compare/v0.1.4...v0.1.5) (2021-07-09)


### Bug Fixes

* fixing self reg and perm issue ([98f995d](https://github.com/forcedotcom/commerce-on-lightning/commit/98f995d59e7ce638656da2ea4770e9900556ef50))



## [0.1.4](https://github.com/forcedotcom/commerce-on-lightning/compare/v0.1.3...v0.1.4) (2021-06-29)


### Features

* fixing guest checkout and self reg ([08e0e4a](https://github.com/forcedotcom/commerce-on-lightning/commit/08e0e4a6917f1135f952820fbd3bdc26c96eb62d))
* fixing guest checkout and self reg ([89c712a](https://github.com/forcedotcom/commerce-on-lightning/commit/89c712ac108a467f70a833f9366f1b0ee71f0fbf))



## [0.1.3](https://github.com/forcedotcom/commerce-on-lightning/compare/v0.1.2...v0.1.3) (2021-06-24)



## [0.1.2](https://github.com/forcedotcom/commerce-on-lightning/compare/v0.1.0...v0.1.2) (2021-06-23)



# [0.1.0](https://github.com/forcedotcom/commerce-on-lightning/compare/cb1fb8fcf49e60ef4acad89f460b3b20c384b683...v0.1.0) (2021-06-22)


### Bug Fixes

* we don't use codecov ([cb1fb8f](https://github.com/forcedotcom/commerce-on-lightning/commit/cb1fb8fcf49e60ef4acad89f460b3b20c384b683))



