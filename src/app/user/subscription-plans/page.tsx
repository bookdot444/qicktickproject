import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const CheckIcon = () => <span className="text-green-500 mr-2">&#10003;</span>;

export default function SubscriptionPlanPage() {
  const plans = [
    {
      title: "Bronze",
      price: "₹7,080.00",
      duration: "3 MONTHS",
      description: "6000 + 18% (7080)",
      features: [
        "Catalogue Website",
        "Photos and Videos",
        "Verified",
        "Visibility",
        "Unlimited Enquiries",
        "Unlimited Leads",
      ],
      isHighlighted: false,
    },
    {
      title: "Silver",
      price: "₹11,800.00",
      duration: "8 MONTHS",
      description: "10000 + 18% (11800)",
      features: [
        "Catalogue Website",
        "Photos and Videos",
        "Verified",
        "Visibility",
        "Unlimited Enquiries",
        "Unlimited Leads",
        "Silver Star (✫)",
        "Digital Banner",
      ],
      isHighlighted: false,
    },
    {
      title: "Gold",
      price: "₹21,240.00",
      duration: "1 YEAR",
      description: "18000 + 18% (21,240)",
      features: [
        "Catalogue Website",
        "Photos and Videos",
        "Verified",
        "Visibility",
        "Unlimited Enquiries",
        "Unlimited Leads",
        "Gold Stars (✫✫✫)",
        "Digital Banner",
        "ROI",
        "References",
        "SMPL (12 Videos)",
        "Account Manager (Tele)",
      ],
      isHighlighted: true,
    },
    {
      title: "Platinum",
      price: "₹30,680.00",
      duration: "2 YEAR",
      description: "26000 + 18% (30,680)",
      features: [
        "Catalogue Website",
        "Photos and Videos",
        "Verified",
        "Visibility",
        "Unlimited Enquiries",
        "Unlimited Leads",
        "Medal (🥇🥈🥉)",
        "Digital Banner",
        "ROI",
        "References",
        "SMPL (36 Videos)",
        "Account Manager (Direct)",
      ],
      isHighlighted: false,
    },
    {
      title: "Diamond",
      price: "₹165,200.00",
      duration: "Lifetime",
      description: "140000 + 18% (165,200)",
      features: [
        "Catalogue Website",
        "Photos and Videos",
        "Verified",
        "Visibility",
        "Unlimited Enquiries",
        "Unlimited Leads",
        "Infinity (∞)",
        "Digital Banner",
        "ROI",
        "References",
        "SMPL (52 Videos)",
        "Account Manager (Direct)",
      ],
      isHighlighted: false,
    },
  ];

  // 🔥 Shared Card Content Function
  const RenderCardContent = (plan: any) => (
    <CardContent className="flex flex-col p-6 h-full">
      {plan.isHighlighted && (
        <div className="text-xs font-bold uppercase tracking-wider text-white bg-yellow-500 rounded-full px-3 py-1 mb-4 w-fit mx-auto shadow-md">
          Most Popular
        </div>
      )}

      <h2
        className={`text-3xl font-extrabold mb-2 text-center ${plan.isHighlighted ? "text-yellow-600" : "text-gray-800"
          }`}
      >
        {plan.title}
      </h2>

      <div className="flex flex-col items-center mb-6">
        <p className="text-4xl font-black text-gray-900">{plan.price}</p>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          {plan.duration}
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 mb-4 pb-4 border-b">
        {plan.description}
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-3">Key Benefits</h3>

      <ul className="space-y-3 text-gray-600 flex-grow">
        {plan.features.map((f: string, i: number) => (
          <li key={i} className="flex items-start text-sm">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-8 w-full px-4 py-3 font-bold rounded-lg transition duration-200 focus:outline-none focus:ring-4 ${plan.isHighlighted
            ? "bg-yellow-500 text-white shadow-xl hover:bg-yellow-600 focus:ring-yellow-500/50"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400/50"
          }`}
      >
        {plan.isHighlighted ? "Get Started" : "Buy Now"}
      </button>
    </CardContent>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-4 text-gray-900">
          Choose Your Plan
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Unlock exclusive features and grow your business with a premium plan.
        </p>

        {/* GRID FIXED */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">

          {/* FIRST ROW (3 ITEMS) */}
          {plans.slice(0, 3).map((plan, index) => (
            <Card
              key={index}
              className={`
                shadow-xl rounded-xl transition-all duration-500 flex flex-col h-full 
                w-full max-w-[360px]
                ${plan.isHighlighted
                  ? "border-4 border-yellow-500 bg-white z-10 ring-4 ring-yellow-300"
                  : "border-2 border-gray-200 hover:shadow-2xl bg-white"
                }
              `}
            >
              {RenderCardContent(plan)}
            </Card>
          ))}

          {/* SECOND ROW CENTERED */}
          <div className="col-span-3 flex justify-center gap-10">
            {plans.slice(3, 5).map((plan, index) => (
              <Card
                key={index}
                className={`
                  shadow-xl rounded-xl transition-all duration-500 flex flex-col h-full 
                  w-full max-w-[360px]
                  ${plan.isHighlighted
                    ? "border-4 border-yellow-500 bg-white z-10 ring-4 ring-yellow-300"
                    : "border-2 border-gray-200 hover:shadow-2xl bg-white"
                  }
                `}
              >
                {RenderCardContent(plan)}
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
