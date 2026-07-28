# [1.4.0](https://github.com/Tomas-Silva-PT/maisvalias-tool/compare/v1.3.0...v1.4.0) (2026-07-28)


### Bug Fixes

* add missing code ([a2adf32](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/a2adf32412d434da328e586366367a1cc83cf56f))
* bad dependencies for integration tests ([208c029](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/208c02984d0ba1069b2515b2a8e6e10e2061daff))
* exchange rate date incorrectly compared to transactions date ([9132d57](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/9132d579b0dd4c1028be1e45ae3be1ee8d9deeb4))
* IKBR parser throwing error when missing broker sections ([54a4ad2](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/54a4ad2c57ec67cf8c33d0c9eb5366c91026408d))
* Interactive Brokers' code name typo ([c5bac10](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/c5bac10713ad5281975e18594d802e8ff8cce0b1))
* missing asset type - not fetching correctly ([73bfa92](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/73bfa929b32fae48d1b50550b22a0a474e41ea5b))
* missing dependencies ([c6ab5f6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/c6ab5f68aca3bb6c3befce997edf10d9e7f62917))
* **src:** bug when comparing transactions ([dd64874](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/dd6487455c866f1e45e0aa5754664be3d53741f6))
* **src:** bug when exporting to IRS ([09be0a8](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/09be0a8a1c07c7dd5556a0c0f53390b865675f2d))
* **src:** bug with integration test for ikbr ([2833a72](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2833a72eca8909dfcd8ca87eb7997c337d2bf9a5))
* **src:** integration test not working with new parsing logic ([3d4c198](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3d4c198b63349d224842beee2849fea0d9c6b5de))
* **src:** pdf parser not returning broker sections ([2237fa1](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2237fa1b1b0ff78fd6495f6d051feb8b3b281a44))
* **src:** trade republic not correctly identifying buy and sell trades ([3f6cbdf](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3f6cbdfeb8c6eca7c381a7e126c879628d824630))
* **src:** weekend - change to last business day for exchange rate fetching ([96bcdb7](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/96bcdb7e20927be47fb6431536d084663aa3ccd9))
* **src:** wrong num in IRS export ([d1ec981](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/d1ec9813c3f33cccd3d24ce00e4a4ac14825cb5a))
* trade republic - correctly intepret numbers on a magnitude of thousands ([3236a79](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3236a79dcb597051bf045d8460b95674fff6f4d8))
* trade republic - read interest gains values ([cf41b45](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/cf41b450d791a01e7ac3727d8a1c14396b59c5fc))
* **website:** bad dependencies ([4aeb6b6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/4aeb6b61f4b4104c9c93342a3e783d86bd561230))
* **website:** bad imports ([ea62478](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ea624781b9e0f6a4ba70dd8d9c59fd73db42567c))
* **website:** change order of columns for IRS panel 9.2 ([65c1469](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/65c146902e21840a5892ade6d1e2b81f187d2070))
* **website:** contact link not working ([a670bb5](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/a670bb5f3a265898b17e7e7cc655ad56ffae3d33))
* **website:** contact link not working pt.2 ([ea3d6a3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ea3d6a31027d615a2e475da5b94bc80dae8354ad))
* **website:** fiscal year summary - round number for total expenses ([e9e2b06](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/e9e2b06da56bab46987fc32355765fe5cb4894fa))
* **website:** missing dependency ([914eaa2](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/914eaa2db6efef3d58bf94bd563fd7161fb1afc9))


### Features

* add api - banco de portugal ([967e059](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/967e0592fc114f7caea89c4ab1bd2ecceadf34bf))
* add asset name property ([ee7702d](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ee7702db1e6b4705f7c2d4e5519c92c35bd25af9))
* add broker - InteractiveBrokers ([71fdae6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/71fdae67852746e7647bd923e897680e42ed2079))
* add broker - LightYear ([752b336](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/752b3366c7c45c2e02df8b7bb5425e5d75e00049))
* add broker - trade republic ([56cc45a](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/56cc45ad9e9dade8f552ddd713d1012abfd28c0b))
* add broker - XTB ([23cf311](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/23cf31169e818ae92d6a4e9d48edf8a7d1baca9f))
* add developer flexibility for future changes in broker files ([3a4fff6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3a4fff621307357fd9f0b65884b601ba04e4e4b5))
* add support for more IRS panel in export functionality ([aa7fd26](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/aa7fd26b939346a3a9c02fc6111bb86a3e3a6359))
* add support for T212 interest on cash ([05903c4](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/05903c41c296c017ddadfcaff75c89f3f5315432))
* add tax heavens for irs consideration ([8e27d39](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/8e27d39337e3ae7cb15ff744842479893a44686a))
* interest gains on excel ([b91a672](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/b91a672d674f90403e3e8ee9517d8ef592a11d06))
* lightyear - add documentation ([8d847da](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/8d847dad3d6f391b18c3b3bbc1ce628e8c1c6da4))
* **src:** Add previous missing ISIN identification ([acef1d9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/acef1d927b4de886a22ff4bf45df70f3fc25a401))
* **src:** new irs infraestructure ([5c8f176](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5c8f176a6d2011db8c6634d168324901f07de5d6))
* support degiro dividends ([0cd1da7](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/0cd1da791adcc61aeaae9d1bb6a51e719c099112))
* support revolut interest gains ([1828150](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/182815063d3e7a4be64d034413da6c5a8ce951a6))
* trade republic - from pdf to csv parsing ([4efba76](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/4efba76571ca0933308d42c071bbb9664d8c3192))
* **website:** Part 1 - New IRS sections ([2f4b7b3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2f4b7b36fd227058db450989cd79db1fed555c2f))
* **website:** revolut allow multiple file input ([517c15d](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/517c15d5fda9b63fd54692b87769a7d93ff75f7a))

# [1.3.0](https://github.com/Tomas-Silva-PT/maisvalias-tool/compare/v1.2.0...v1.3.0) (2026-02-01)


### Bug Fixes

* add comments to clarify the meaning of acquisition and realization values ([ab32127](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ab321277bdd866522804aee7aa301f17dce28b2c))


### Features

* add broker - strike ([0b7fe09](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/0b7fe0984406c58fc4ecc6f7ad5e860d6e9626c4))

# [1.2.0](https://github.com/Tomas-Silva-PT/maisvalias-tool/compare/v1.1.0...v1.2.0) (2025-07-01)


### Bug Fixes

* add missing fees on Trading212 and Degiro ([b459b35](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/b459b35ac59b5d52598e1b58e82dfd18dc9763aa))
* **revolut:** not taking account fees ([6322487](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/63224877ee43378bcb07c4067a3dde630388b83d))


### Features

* add broker - degiro ([cc876d6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/cc876d6a02dcba0a829f6b98104d0b22e1d316e7))

# [1.1.0](https://github.com/Tomas-Silva-PT/maisvalias-tool/compare/v1.0.0...v1.1.0) (2025-06-21)


### Bug Fixes

* acquisition date and realized date ([204c18d](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/204c18d46b181124cc1798ea29ccb9c7253f9289))
* add total's columns to generated IRS XML ([936b2a7](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/936b2a769f46a994e7b8f7c8a0e43dfc9358fe14))
* bad import ([da67dee](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/da67dee2074d7b1f1ad5f281cdd91d86aa31a631))
* dividend missing country ([f3e95db](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/f3e95dbf818c785c0058b99347e5b764b49b023c))
* **docs:** remove unnecessary icons ([736d4ad](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/736d4ad2827d4c0c9e4c797792b894dbd0af0d4a))
* exchange rate for trading212 parser ([f5b8046](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/f5b80469e601052ac9ef886d15900e39f8f11f92))
* fallback domiciled country for dividends ([28bd785](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/28bd785ea35abaadd4860b9d07c7cbb537da1221))
* missing error dialog on step 2 ([4c6ad24](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/4c6ad245869313eb9c17cbfd3ba7b4b5d9ade8d6))
* simplify logs ([58cb043](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/58cb043e6f32a157906fd6426c98b0f91c4acb64))
* simplify logs (2) ([87a9cc4](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/87a9cc4ce90738c2b204b5b57512c7c3daeb2399))
* simplify logs (3) ([a1d6f95](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/a1d6f9564cedd62b2535b57f2456987c2eed4a9b))
* update README.md ([9fa220e](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/9fa220ead29240e842f37fe3d7fcae7f30a72cc2))
* **website:** fix import statement ([18084e5](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/18084e5f6b98540c4b237408077e4197c163993a))
* wrong timezone for exchange rate dates fetched from API ([e96da3a](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/e96da3a9df2814b4add5f1645ad3ab12dfc3a8c0))


### Features

* add fallback capabilities to call API ([45021d3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/45021d3ab4bb5e0e27bcbe113faf553a26151402))
* add new proxy for fallback api calls ([ad7497b](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ad7497b5ef4b2d11a6aefbc0e2a287366fe33f5f))
* add notice for capital gains domiciled country ([3f53dad](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3f53dad9d8be4e594c46f7d06b76d8e0e65fba03))
* enrich excel exportability ([ae1e1c3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ae1e1c3ea4dbb24786db3287b89b5f308cf07da5))
* **website:** add contact to page footer ([120c708](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/120c708fcdad31ee27e31a56b46303d8999f20a3))
* **website:** add error handling for unavailabilty of proxies ([9f1d9e9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/9f1d9e9383521206440cdac66e9c54faf8540ead))
* **website:** add simple error handling for livedemo ([d76e963](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/d76e963c0cb274441d1f71917361be2c76c4ee9c))
* **website:** add smooth scrolling to livedemo ([c57fae2](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/c57fae2128d875c758d75e259a9700b7aca3f8d3))
* **website:** enhance IRS exportability ([9b0bbd3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/9b0bbd3c5b74a2d25889ee17d4ba34022ccdba8d))
* **website:** toggle IRS exportability elements ([661ed34](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/661ed34a21ea1c9ae1c1c39844686bde2651388d))
* **website:** UI overhaul ([1d49d66](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/1d49d664e855b7455f5807a224cb1c34ec990cee))


### Performance Improvements

* add logic to minimize API calls for exchange rates fetching ([66ae97b](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/66ae97b994360522e68d378d6ebe0424fd5ed408))
* reduce API calls with batching ([5d58790](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5d58790b3ec3dca813e622964d44047d09184789))

# 1.0.0 (2025-05-25)


### Bug Fixes

* change shield badge style ([7de1c93](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/7de1c933be325e80f15eb8b03a6e66b37fd08b8d))
* change star shield badge ([cbdb7ed](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/cbdb7ed9f2974fd9ef974139053bc4ef0309e566))
* change star shield badge ([2c85ea5](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2c85ea5e9b367a434031e4779904a067d76e9f0b))
* **ci:** add missing dependency ([f58992f](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/f58992feff41a0c77cc61fda5f248e5c93514837))
* dependencies for codebase deployment ([3016bbf](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3016bbf8ed35fecddc17da1d26eff2cc09c9dda9))
* fallback for github action error - YahooFinance API test ([5e78bab](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5e78bab81b4d72e4a5ca550f39226f3b6762056f))
* github action deployment source folder ([82db875](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/82db8751112514d782705f5c9cb6f650f95848bc))
* github action for testing connection to YahooFinanceAPI ([00ccd0f](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/00ccd0f221771730ed8bde29cde620f83b837a31))
* github action for testing connection to YahooFinanceAPI ([d1f2195](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/d1f219542765c368ab7140fad4585292313dd39e))
* github action for testing connection to YahooFinanceAPI ([b7387b3](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/b7387b30f7aba89fd7ff5c0c6ee15498ac3d1366))
* github action for testing connection to YahooFinanceAPI ([bded5a7](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/bded5a7f16a42b89ad95b95ab4d6b20e38857332))
* github action for testing connection to YahooFinanceAPI ([60466ec](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/60466ecb7643e61b413399089ceae15cf372cd67))
* github action for testing connection to YahooFinanceAPI ([e14c673](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/e14c673829a68d8cc61ad51a1cedbb04a8ac0bc2))
* **website:** Add cache-dependency-path to deploy action ([2b58bb9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2b58bb943ba7d7f562916816c2c8a9e22581c7d4))
* **website:** add delayed api fetching ([8704658](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/8704658025d183a3eff5ed209d1dc4fa4eec4353))
* **website:** add missing dependency 'lucide-react' ([0e6f47d](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/0e6f47db23a4dab85665ce553535bb745403ce7b))
* **website:** add more responsiveness overall ([ed35f27](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ed35f273e460d768c4f8db4331638a28bae8f034))
* **website:** fix doc broken links ([5e807d5](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5e807d51c00b031d0a7b00706efd791c5a73eb5a))
* **website:** Testing Github Actions ([2aa6142](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/2aa61427200364b820eb5b691d688c83a621f07e))
* **website:** Testing Github Actions (2) ([af1a403](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/af1a4039fbd9820e09b27cd201de1866818bbd64))


### Features

* add fees and taxes to the formatter of PT dividends ([5d2e65a](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5d2e65ae4863d872e5208a98066f948c5f606605))
* add fees, taxes and broker's country into the formatter of PT capital gains ([aff868f](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/aff868f259ae62daddcbd03960ecbce8ea00e2a7))
* add manual exchange rate ([c9f47cf](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/c9f47cf6d62ea9f80048ac4b66b7068436f1f891))
* add pt irs xml auto filling with capital gains and dividends ([95c818f](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/95c818ff43c90e7a42d7d95e0c975b89ce10b2ff))
* add shield badges ([40c336c](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/40c336cb8a24afdf56b78343ccaa40fa7934d91b))
* add support to broker - Revolut ([f32a6b0](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/f32a6b0156522492429c392a0a9fd3b9867647f2))
* added simple website for testing ([404a244](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/404a244d675ac6e1fa73303dc93ec730b6932cec))
* **formatter:** add currency exchange ([ca7e731](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ca7e731d4de4e0ecb3d390d4407ac43ab41c6235))
* **website:** add about page ([9dd7ca9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/9dd7ca9b3062f019047f5a2560c5cdfb5c168e72))
* **website:** add animation to help dialog ([3c42fd6](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3c42fd6e753a3cdfd7a5d7800d4c8bc2de51152e))
* **website:** add back navigation in live demo form ([db4e42c](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/db4e42ca1fec0cddd3adb74b40c50d9c9aa8adf5))
* **website:** add demo output for capital gains and dividends ([79944ad](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/79944add241d939c9974c4563ca0d41b135d59a0))
* **website:** add dependency xmldom ([98e3e5d](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/98e3e5d2bd4d347e75579ed5a407539904b91378))
* **website:** add disclaimer pop up on demo page ([6c9cbfa](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/6c9cbfa15d2e7e6b5153a1c56da6999ed58f6e0d))
* **website:** add docusaurus website for documentation ([8f7d67b](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/8f7d67b34121627da99c4363b38644d6c8292717))
* **website:** add exportability to excel ([0b94fb7](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/0b94fb71b25047fbf4c7867e7906de0b481a22b8))
* **website:** add exportability to IRS declaration ([cd469dd](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/cd469ddea3b7d96c73aebe3610475f5c4324fdcc))
* **website:** add help dialog to step 2 of live demo ([3bc8d21](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/3bc8d21e0b29ae1112914e70ebf42e6b6088f653))
* **website:** add link to github discussions ([0712601](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/071260114160d558ec613657e0de9c3f9e8597f8))
* **website:** add notice for upcoming broker support - step 1 ([c7c2d54](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/c7c2d54d885c6afb5711b28f466f9e5bd27c9a2f))
* **website:** add search bar ([849e9d9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/849e9d9f44e8804984c9e0086ca05aee03d48beb))
* **website:** add support for multiple help dialog links ([ff3a198](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ff3a198ca0a08c68c250686c76b3d41845433e0a))
* **website:** add wizard for livedemo pt. 1 ([0401f56](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/0401f562744918b3bf89e53019343eec3fd9fe22))
* **website:** add wizard for livedemo pt. 2 ([de0d10e](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/de0d10eb3bff904fedba88ecf52bb2dca00f4d19))
* **website:** add wizard for livedemo pt. 3 ([ab201a0](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ab201a0631c3a97e6bd6b73a1a70229b377b96d9))
* **website:** change homepage ([5532ef9](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/5532ef945a5815bc6ee9f15dccb5b56548b9a2d3))
* **website:** styling calculated result of demo page ([ef6c049](https://github.com/Tomas-Silva-PT/maisvalias-tool/commit/ef6c04974d53ab448cc8dddea9e0cabc7a18303f))
