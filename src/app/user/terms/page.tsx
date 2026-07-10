"use client";

type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "subhead"; text: string };

const sections: { id: string; number: number; title: string; blocks: Block[] }[] = [
  {
    id: "our-services",
    number: 1,
    title: "OUR SERVICES",
    blocks: [
      {
        type: "p",
        text: `The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation, or which would subject us to any registration requirement within such jurisdiction or country.`,
      },
      {
        type: "p",
        text: `Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.`,
      },
    ],
  },
  {
    id: "intellectual-property",
    number: 2,
    title: "INTELLECTUAL PROPERTY RIGHTS",
    blocks: [
      { type: "subhead", text: "Our intellectual property" },
      {
        type: "p",
        text: `We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks"). Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.`,
      },
      {
        type: "p",
        text: `The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.`,
      },
      { type: "subhead", text: "Your use of our Services" },
      {
        type: "p",
        text: `Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:`,
      },
      {
        type: "list",
        items: [
          `access the Services; and`,
          `download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.`,
        ],
      },
      {
        type: "p",
        text: `Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.`,
      },
      {
        type: "p",
        text: `If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: qicktick2025@gmail.com. If we ever grant you permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.`,
      },
      {
        type: "p",
        text: `We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.`,
      },
      {
        type: "p",
        text: `Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.`,
      },
      { type: "subhead", text: "Your submissions and contributions" },
      {
        type: "p",
        text: `Please review this section and the "PROHIBITED ACTIVITIES" section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.`,
      },
      {
        type: "p",
        text: `Submissions: By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.`,
      },
      {
        type: "p",
        text: `You are responsible for what you post or upload: By sending us Submissions and/or posting Contributions through any part of the Services, or making Contributions accessible through the Services by linking your account to any of your social networking accounts, you:`,
      },
      {
        type: "list",
        items: [
          `confirm that you have read and agree with our "PROHIBITED ACTIVITIES" and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;`,
          `to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;`,
          `warrant that any such Submission and/or Contributions are original to you, or that you have the necessary rights and licenses to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and`,
          `warrant and represent that your Submissions and/or Contributions do not constitute confidential information.`,
        ],
      },
      {
        type: "p",
        text: `You are solely responsible for your Submissions and/or Contributions, and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party's intellectual property rights, or (c) applicable law.`,
      },
      { type: "subhead", text: "We may remove or edit your Content" },
      {
        type: "p",
        text: `Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.`,
      },
    ],
  },
  {
    id: "user-representations",
    number: 3,
    title: "USER REPRESENTATIONS",
    blocks: [
      {
        type: "p",
        text: `By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means, whether through a bot, script, or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.`,
      },
      {
        type: "p",
        text: `If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).`,
      },
      { type: "subhead", text: "Contributions" },
      {
        type: "p",
        text: `The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services — including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, ratings, suggestions, personal information, or other material ("Contributions"). Any Submission that is publicly posted shall also be treated as a Contribution.`,
      },
      {
        type: "p",
        text: `You understand that Contributions may be viewable by other users of the Services and possibly through third-party websites.`,
      },
      { type: "subhead", text: "When you post Contributions, you grant us a license (including use of your name, trademarks, and logos)" },
      {
        type: "p",
        text: `By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right and license to use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including without limitation your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicense the licenses granted in this section.`,
      },
      {
        type: "p",
        text: `Our use and distribution may occur in any media formats and through any media channels. This license includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.`,
      },
    ],
  },
  {
    id: "user-registration",
    number: 4,
    title: "USER REGISTRATION",
    blocks: [
      {
        type: "p",
        text: `You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.`,
      },
    ],
  },
  {
    id: "products",
    number: 5,
    title: "PRODUCTS",
    blocks: [
      {
        type: "p",
        text: `All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.`,
      },
    ],
  },
  {
    id: "purchases-payment",
    number: 6,
    title: "PURCHASES AND PAYMENT",
    blocks: [
      { type: "p", text: `We accept the following forms of payment:` },
      {
        type: "list",
        items: [
          `Accept all online payments`,
          `Cheque`,
          `Phone pay/Paytm/others`,
          `Net banking`,
          `Mobile banking`,
          `Other online payments`,
        ],
      },
      {
        type: "p",
        text: `You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in Rupees.`,
      },
      {
        type: "p",
        text: `You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.`,
      },
      {
        type: "p",
        text: `We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.`,
      },
    ],
  },
  {
    id: "subscriptions",
    number: 7,
    title: "SUBSCRIPTIONS",
    blocks: [
      { type: "subhead", text: "Billing and Renewal" },
      {
        type: "p",
        text: `Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle will depend on the type of subscription plan you choose when you subscribed to the Services.`,
      },
      { type: "subhead", text: "Free Trial" },
      {
        type: "p",
        text: `We offer a 7-day free trial to new users who register with the Services. The account will be charged according to the user's chosen subscription at the end of the free trial.`,
      },
      { type: "subhead", text: "Cancellation" },
      {
        type: "p",
        text: `You can cancel your subscription at any time by contacting us using the contact information provided below. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at qicktick2025@gmail.com.`,
      },
      { type: "subhead", text: "Fee Changes" },
      {
        type: "p",
        text: `We may from time to time make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.`,
      },
    ],
  },
  {
    id: "refunds",
    number: 8,
    title: "REFUNDS POLICY",
    blocks: [
      { type: "p", text: `Please review our Return Policy posted on the Services prior to making any purchases.` },
      { type: "p", text: `We do not refund our subscription fees for any reason.` },
    ],
  },
  {
    id: "prohibited-activities",
    number: 9,
    title: "PROHIBITED ACTIVITIES",
    blocks: [
      {
        type: "p",
        text: `You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.`,
      },
      { type: "p", text: `As a user of the Services, you agree not to:` },
      {
        type: "list",
        items: [
          `Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.`,
          `Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.`,
          `Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.`,
          `Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.`,
          `Use any information obtained from the Services in order to harass, abuse, or harm another person.`,
          `Make improper use of our support services or submit false reports of abuse or misconduct.`,
          `Use the Services in a manner inconsistent with any applicable laws or regulations.`,
          `Engage in unauthorized framing of or linking to the Services.`,
          `Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.`,
          `Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.`,
          `Delete the copyright or other proprietary rights notice from any Content.`,
          `Attempt to impersonate another user or person or use the username of another user.`,
          `Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation clear graphics interchange formats ("gifs"), 1x1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").`,
          `Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.`,
          `Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.`,
          `Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.`,
          `Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.`,
          `Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.`,
          `Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.`,
          `Use a buying agent or purchasing agent to make purchases on the Services.`,
          `Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.`,
          `Use the Services as part of any effort to compete with us, or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.`,
        ],
      },
    ],
  },
  {
    id: "user-generated-contributions",
    number: 10,
    title: "USER GENERATED CONTRIBUTIONS",
    blocks: [
      {
        type: "p",
        text: `The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.`,
      },
      { type: "p", text: `When you create or make available any Contributions, you thereby represent and warrant that:` },
      {
        type: "list",
        items: [
          `The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.`,
          `You are the creator and owner of, or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.`,
          `You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.`,
          `Your Contributions are not false, inaccurate, or misleading.`,
          `Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.`,
          `Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).`,
          `Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.`,
          `Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.`,
          `Your Contributions do not violate any applicable law, regulation, or rule.`,
          `Your Contributions do not violate the privacy or publicity rights of any third party.`,
          `Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.`,
          `Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.`,
          `Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.`,
        ],
      },
      {
        type: "p",
        text: `Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.`,
      },
    ],
  },
  {
    id: "contribution-license",
    number: 11,
    title: "CONTRIBUTION LICENSE",
    blocks: [
      {
        type: "p",
        text: `By posting your Contributions to any part of the Services or making Contributions accessible to the Services by linking your account from the Services to any of your social networking accounts, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including without limitation your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.`,
      },
      {
        type: "p",
        text: `This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.`,
      },
      {
        type: "p",
        text: `We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.`,
      },
      {
        type: "p",
        text: `We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.`,
      },
    ],
  },
  {
    id: "guidelines-reviews",
    number: 12,
    title: "GUIDELINES FOR REVIEWS",
    blocks: [
      { type: "p", text: `We may provide you areas on the Services to leave reviews or ratings. When posting a review, you must comply with the following criteria:` },
      {
        type: "list",
        items: [
          `you should have firsthand experience with the person/entity being reviewed;`,
          `your reviews should not contain offensive profanity, or abusive, racist, offensive, or hateful language;`,
          `your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability;`,
          `your reviews should not contain references to illegal activity;`,
          `you should not be affiliated with competitors if posting negative reviews;`,
          `you should not make any conclusions as to the legality of conduct;`,
          `you may not post any false or misleading statements; and`,
          `you may not organize a campaign encouraging others to post reviews, whether positive or negative.`,
        ],
      },
      {
        type: "p",
        text: `We may accept, reject, or remove reviews in our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate. Reviews are not endorsed by us and do not necessarily represent our opinions or the views of any of our affiliates or partners. We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to review.`,
      },
    ],
  },
  {
    id: "mobile-application-license",
    number: 13,
    title: "MOBILE APPLICATION LICENSE",
    blocks: [
      { type: "subhead", text: "Use License" },
      {
        type: "p",
        text: `If you access the Services via the App, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Legal Terms. You shall not:`,
      },
      {
        type: "list",
        items: [
          `except as permitted by applicable law, decompile, reverse engineer, disassemble, attempt to derive the source code of, or decrypt the App;`,
          `make any modification, adaptation, improvement, enhancement, translation, or derivative work from the App;`,
          `violate any applicable laws, rules, or regulations in connection with your access or use of the App;`,
          `remove, alter, or obscure any proprietary notice (including any notice of copyright or trademark) posted by us or the licensors of the App;`,
          `use the App for any revenue-generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended;`,
          `make the App available over a network or other environment permitting access or use by multiple devices or users at the same time;`,
          `use the App for creating a product, service, or software that is directly or indirectly competitive with or in any way a substitute for the App;`,
          `use the App to send automated queries to any website or to send any unsolicited commercial email; or`,
          `use any proprietary information or any of our interfaces or our other intellectual property in the design, development, manufacture, licensing, or distribution of any applications, accessories, or devices for use with the App.`,
        ],
      },
      { type: "subhead", text: "Apple and Android Devices" },
      {
        type: "p",
        text: `The following terms apply when you use the App obtained from either the Apple Store or Google Play (each an "App Distributor") to access the Services: (1) the license granted to you for our App is limited to a non-transferable license to use the application on a device that utilizes the Apple iOS or Android operating systems, as applicable, and in accordance with the usage rules set forth in the applicable App Distributor's terms of service; (2) we are responsible for providing any maintenance and support services with respect to the App as specified in the terms and conditions of this mobile application license contained in these Legal Terms or as otherwise required under applicable law, and you acknowledge that each App Distributor has no obligation whatsoever to furnish any maintenance and support services with respect to the App; (3) in the event of any failure of the App to conform to any applicable warranty, you may notify the applicable App Distributor, and the App Distributor, in accordance with its terms and policies, may refund the purchase price, if any, paid for the App, and to the maximum extent permitted by applicable law, the App Distributor will have no other warranty obligation whatsoever with respect to the App; (4) you represent and warrant that (i) you are not located in a country that is subject to a US government embargo, or that has been designated by the US government as a "terrorist supporting" country, and (ii) you are not listed on any US government list of prohibited or restricted parties; (5) you must comply with applicable third-party terms of agreement when using the App, e.g., if you have a VoIP application, then you must not be in violation of their wireless data service agreement when using the App; and (6) you acknowledge and agree that the App Distributors are third-party beneficiaries of the terms and conditions in this mobile application license contained in these Legal Terms, and that each App Distributor will have the right (and will be deemed to have accepted the right) to enforce the terms and conditions in this mobile application license contained in these Legal Terms against you as a third-party beneficiary thereof.`,
      },
    ],
  },
  {
    id: "social-media",
    number: 14,
    title: "SOCIAL MEDIA",
    blocks: [
      {
        type: "p",
        text: `As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers (each such account, a "Third-Party Account") by either: (1) providing your Third-Party Account login information through the Services; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account.`,
      },
      {
        type: "p",
        text: `You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.`,
      },
      {
        type: "p",
        text: `By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the "Social Network Content") so that it is available on and through the Services via your account, including without limitation any friend lists and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account. Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Services. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the Services. You will have the ability to disable the connection between your account on the Services and your Third-Party Accounts at any time.`,
      },
      {
        type: "p",
        text: `PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS. We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content.`,
      },
      {
        type: "p",
        text: `You acknowledge and agree that we may access your email address book associated with a Third-Party Account and your contacts list stored on your mobile device or tablet computer solely for purposes of identifying and informing you of those contacts who have also registered to use the Services. You can deactivate the connection between the Services and your Third-Party Account by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.`,
      },
    ],
  },
  {
    id: "third-party",
    number: 15,
    title: "THIRD-PARTY WEBSITES AND CONTENT",
    blocks: [
      {
        type: "p",
        text: `The Services may contain (or you may be sent via the Site or App) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content. Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us.`,
      },
      {
        type: "p",
        text: `If you decide to leave the Services and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the Services or relating to any applications you use or install from the Services. Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases, which are exclusively between you and the applicable third party.`,
      },
      {
        type: "p",
        text: `You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites, and you shall hold us blameless from any harm caused by your purchase of such products or services. Additionally, you shall hold us blameless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.`,
      },
    ],
  },
  {
    id: "advertisers",
    number: 16,
    title: "ADVERTISERS",
    blocks: [
      {
        type: "p",
        text: `We allow advertisers to display their advertisements and other information in certain areas of the Services, such as sidebar advertisements or banner advertisements. We simply provide the space to place such advertisements, and we have no other relationship with advertisers.`,
      },
    ],
  },
  {
    id: "services-management",
    number: 17,
    title: "SERVICES MANAGEMENT",
    blocks: [
      { type: "p", text: `We reserve the right, but not the obligation, to:` },
      {
        type: "list",
        items: [
          `monitor the Services for violations of these Legal Terms;`,
          `take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities;`,
          `in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;`,
          `in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and`,
          `otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.`,
        ],
      },
    ],
  },
  {
    id: "term-termination",
    number: 18,
    title: "TERM AND TERMINATION",
    blocks: [
      {
        type: "p",
        text: `These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.`,
      },
      {
        type: "p",
        text: `If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.`,
      },
    ],
  },
  {
    id: "modifications-interruptions",
    number: 19,
    title: "MODIFICATIONS AND INTERRUPTIONS",
    blocks: [
      {
        type: "p",
        text: `We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.`,
      },
      {
        type: "p",
        text: `We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.`,
      },
    ],
  },
  {
    id: "governing-law",
    number: 20,
    title: "GOVERNING LAW",
    blocks: [
      {
        type: "p",
        text: `These Legal Terms shall be governed by and defined following the laws of India. QIICKTICK and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.`,
      },
      { type: "subhead", text: "Exceptions to Informal Negotiations and Arbitration" },
      {
        type: "p",
        text: `The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable, and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.`,
      },
    ],
  },
  {
    id: "dispute-resolution",
    number: 21,
    title: "DISPUTE RESOLUTION",
    blocks: [
      { type: "subhead", text: "Informal Negotiations" },
      {
        type: "p",
        text: `To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least seven (7) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.`,
      },
      { type: "subhead", text: "Binding Arbitration" },
      {
        type: "p",
        text: `Any dispute arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels, Avenue Louise, 146), according to the Rules of this ICAC, which, as a result of referring to it, is considered as the part of this clause. The number of arbitrators shall be 1. The seat, or legal place, of arbitration shall be India. The language of the proceedings shall be English. The governing law of these Legal Terms shall be the substantive law of India.`,
      },
      { type: "subhead", text: "Restrictions" },
      {
        type: "p",
        text: `The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law: (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.`,
      },
    ],
  },
  {
    id: "corrections",
    number: 22,
    title: "CORRECTIONS",
    blocks: [
      {
        type: "p",
        text: `There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.`,
      },
    ],
  },
  {
    id: "disclaimer",
    number: 23,
    title: "DISCLAIMER",
    blocks: [
      {
        type: "p",
        text: `THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES.`,
      },
      {
        type: "p",
        text: `WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.`,
      },
    ],
  },
  {
    id: "limitations-liability",
    number: 24,
    title: "LIMITATIONS OF LIABILITY",
    blocks: [
      {
        type: "p",
        text: `IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE ONE (1) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.`,
      },
      {
        type: "p",
        text: `CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.`,
      },
    ],
  },
  {
    id: "indemnification",
    number: 25,
    title: "INDEMNIFICATION",
    blocks: [
      {
        type: "p",
        text: `You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services.`,
      },
      {
        type: "p",
        text: `Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.`,
      },
    ],
  },
  {
    id: "user-data",
    number: 26,
    title: "USER DATA",
    blocks: [
      {
        type: "p",
        text: `We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.`,
      },
    ],
  },
  {
    id: "electronic-communications",
    number: 27,
    title: "ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES",
    blocks: [
      {
        type: "p",
        text: `Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.`,
      },
      {
        type: "p",
        text: `YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.`,
      },
    ],
  },
  {
    id: "sms-text-messaging",
    number: 28,
    title: "SMS TEXT MESSAGING",
    blocks: [
      { type: "subhead", text: "Message Frequency" },
      { type: "p", text: `[Not specified in the source document.]` },
      { type: "subhead", text: "Opting Out" },
      { type: "p", text: `[Not specified in the source document.]` },
      { type: "subhead", text: "Message and Data Rates" },
      {
        type: "p",
        text: `Please be aware that message and data rates may apply to any SMS messages sent or received. The rates are determined by your carrier and the specifics of your mobile plan.`,
      },
      { type: "subhead", text: "Support" },
      {
        type: "p",
        text: `If you have any questions or need assistance regarding our SMS communications, please email us at qicktick2025@gmail.com or call at 7892999063.`,
      },
    ],
  },
  {
    id: "miscellaneous",
    number: 29,
    title: "MISCELLANEOUS",
    blocks: [
      {
        type: "p",
        text: `These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time.`,
      },
      {
        type: "p",
        text: `We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment, or agency relationship created between you and us as a result of these Legal Terms or use of the Services.`,
      },
      {
        type: "p",
        text: `You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.`,
      },
    ],
  },
  {
    id: "contact-us",
    number: 30,
    title: "CONTACT US",
    blocks: [
      {
        type: "p",
        text: `In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:`,
      },
      {
        type: "p",
        text: `QIICKTICK\nVidyanagar\nkabbur\nHaveri, Karnataka 581110\nIndia\n\nPhone: 7892999063\nqicktick2025@gmail.com`,
      },
    ],
  },
];

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === "subhead") {
    return <p className="mt-5 mb-1 font-black text-gray-900 uppercase tracking-tight text-[13px]">{block.text}</p>;
  }
  if (block.type === "list") {
    return (
      <ul className="my-3 list-none space-y-2 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2 leading-[1.7] text-gray-600 text-xs md:text-sm font-medium">
            <span className="text-red-600 font-black">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="my-3 whitespace-pre-line leading-[1.7] text-gray-700">{block.text}</p>;
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-20 px-6 relative border-b border-yellow-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full mb-6 border border-yellow-200">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-700">
              Legal Agreement
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase mb-6">
            TERMS OF <br /> <span className="text-red-600">SERVICE</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            Agreement to our legal terms and operational protocols
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* AGREEMENT INTRO */}
        <section className="mb-16 bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight uppercase">Agreement to our Legal Terms</h2>
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <p>
              We are QIICKTICK, doing business as QT (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), a company
              registered in India at Vidyanagar, KABBUR, Haveri, Karnataka 581110.
            </p>
            <p>
              We operate the website{" "}
              <a href="http://www.qicktick.com" className="text-red-600 underline font-bold">
                http://www.qicktick.com
              </a>{" "}
              (the &quot;Site&quot;), the mobile application QIICKTICK (the &quot;App&quot;), as well as any other
              related products and services that refer or link to these legal terms (the &quot;Legal Terms&quot;)
              (collectively, the &quot;Services&quot;).
            </p>
            <p className="bg-white p-4 rounded-lg border border-gray-200">
              This is commonly based on a subscription-based company for giving leads or customers to the register
              shop vendors and business owners. We have also included transportation benefits for customers and
              all; also, it&apos;s mainly helpful to B2B and B2C sectors. We will give big business to those
              categories. We will promote business categories and give the business from our side. This is brief
              information about our company.
            </p>
            <p>
              You can contact us by phone at <strong>7892999063</strong>, email at{" "}
              <strong>qicktick2025@gmail.com</strong>, or by mail to Vidyanagar, kabbur, Haveri, Karnataka 581110,
              India.
            </p>
            <p>
              These Legal Terms constitute a legally binding agreement made between you, whether personally or on
              behalf of an entity (&quot;you&quot;), and QIICKTICK, concerning your access to and use of the
              Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound
              by all of these Legal Terms.
            </p>
            <p className="font-black text-gray-900 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE
              SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
            <p>
              Supplemental terms and conditions or documents that may be posted on the Services from time to time
              are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion,
              to make changes or modifications to these Legal Terms at any time and for any reason. We will alert
              you about any changes by updating the &quot;Last updated&quot; date of these Legal Terms, and you
              waive any right to receive specific notice of each such change. It is your responsibility to
              periodically review these Legal Terms to stay informed of updates. You will be subject to, and will
              be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by
              your continued use of the Services after the date such revised Legal Terms are posted.
            </p>
            <p>The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.</p>
            <p>We recommend that you print a copy of these Legal Terms for your records.</p>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section className="mb-16">
          <div className="bg-[#FEF3C7] p-8 rounded-3xl border border-yellow-200">
            <p className="text-[10px] font-black uppercase text-yellow-700 tracking-widest mb-4">Table of Contents</p>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-xs md:text-sm font-bold text-gray-800 hover:text-red-600 transition-colors"
                  >
                    {s.number}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FULL LEGAL SECTIONS */}
        <div className="space-y-12 text-sm leading-relaxed text-gray-600">
          {sections.map((section) => {
            const isDark = section.number === 6 || section.number === 7;
            const isDisclaimerBlock = section.number === 23 || section.number === 24;

            if (isDark) {
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 bg-gray-900 text-white p-8 rounded-3xl"
                >
                  <h3 className="text-xl font-black mb-6 uppercase text-yellow-400 tracking-tighter">
                    {section.number}. {section.title}
                  </h3>
                  <div className="space-y-3 text-sm text-gray-200">
                    {section.blocks.map((block, i) => {
                      if (block.type === "subhead") {
                        return (
                          <p key={i} className="mt-4 mb-1 font-black text-yellow-300 uppercase tracking-tight text-[13px]">
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === "list") {
                        return (
                          <div key={i} className="flex flex-wrap gap-2 my-2">
                            {block.items.map((item, j) => (
                              <span
                                key={j}
                                className="bg-gray-800 text-[10px] px-3 py-1 rounded-full border border-gray-700 uppercase font-black"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <p key={i} className="leading-[1.7] text-gray-300">
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                </section>
              );
            }

            if (isDisclaimerBlock) {
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 border-2 border-red-600 p-8 rounded-3xl"
                >
                  <h3 className="text-red-600 font-black mb-4 uppercase tracking-tighter">
                    {section.number}. {section.title}
                  </h3>
                  {section.blocks.map((block, i) => (
                    <p
                      key={i}
                      className="text-[10px] font-black leading-relaxed uppercase mb-4 text-gray-800"
                    >
                      {block.type === "p" ? block.text : null}
                    </p>
                  ))}
                </section>
              );
            }

            if (section.number === 30) {
              return (
                <section key={section.id} id={section.id} className="scroll-mt-28 pt-12 border-t border-gray-100">
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
                        {section.number}. {section.title}
                      </h3>
                      {section.blocks.map((block, i) => (
                        <p key={i} className="text-gray-600 mb-8 font-medium whitespace-pre-line leading-relaxed">
                          {block.type === "p" ? block.text : null}
                        </p>
                      ))}
                      <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]">
                        <div className="space-y-1 font-bold text-gray-900 uppercase tracking-tight">
                          <p className="text-red-600 text-xl font-black mb-2 tracking-tighter">QIICKTICK</p>
                          <p>Vidyanagar, kabbur</p>
                          <p>Haveri, Karnataka 581110, India</p>
                          <div className="pt-4 space-y-1">
                            <p>Phone: <span className="text-red-600">7892999063</span></p>
                            <p>Email: <span className="text-red-600 underline">qicktick2025@gmail.com</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-[#FEF3C7] p-8 rounded-3xl border border-yellow-200">
                      <p className="text-[10px] font-black uppercase text-yellow-700 tracking-widest mb-2">Legal Compliance</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight">
                        &quot;We give big business to our categories. We promote business and give the business from our side.&quot;
                      </p>
                    </div>
                  </div>
                </section>
              );
            }

            return (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tighter">
                  {section.number}. {section.title}
                </h3>
                {section.blocks.map((block, i) => (
                  <BlockRenderer key={i} block={block} />
                ))}
              </section>
            );
          })}
        </div>
      </div>

      {/* --- STICKY PRINT BUTTON --- */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => window.print()}
          className="bg-black text-white p-4 rounded-full shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 group"
          title="Print Terms"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  );
}