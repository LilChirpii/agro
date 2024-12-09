import React, { useState } from "react";
import NavLink from "./NavLink";
import {
    Bell,
    Brain,
    BugIcon,
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    Cog,
    CogIcon,
    Earth,
    Flower,
    Folder,
    HandCoins,
    Handshake,
    LayoutDashboard,
    Leaf,
    NotebookTextIcon,
    Tally5Icon,
    Tractor,
    Trees,
    User2,
    Wheat,
    WheatIcon,
    Wrench,
} from "lucide-react";
import { User } from "@/types";
// import "../../css/Sidebar.css";

type Props = {
    user: {
        pfp: string;
        firstname: string;
        lastname: string;
        email: string;
        role: "admin" | "super admin";
    };
};

export default function Sidebar({ user }: Props) {
    const [expanded, setExpanded] = useState(true);
    const [isAllocationOpen, setIsAllocationOpen] = useState(false);
    const [isCommodityOpen, setIsCommodityOpen] = useState(false);
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
    const [isCropDamagesOpen, setIsCropDamagesOpen] = useState(false);

    const handleToggle = () => {
        setIsAllocationOpen((prev) => !prev);
    };

    const handleCommodityToggle = () => {
        setIsCommodityOpen((prev) => !prev);
    };

    const handleRecommendationToggle = () => {
        setIsCommodityOpen((prev) => !prev);
    };

    const handleCropDamagesToggle = () => {
        setIsCropDamagesOpen((prev) => !prev);
    };

    return (
        <div
            className={`fixed mt-20 p-5 overflow-hidden bg-white rounded-[1rem] ml-3 shadow  {expanded ? "w-[10rem]" : "w-[20rem]}`}
        >
            <button
                onClick={() => setExpanded((curr) => !curr)}
                className="transition-all"
            >
                {expanded ? (
                    <ChevronFirst size={24} />
                ) : (
                    <ChevronLast size={24} />
                )}
            </button>

            <ul>
                <span className="ml-2 mb-4 text-sm text-slate-400">Main</span>
                <li className="text-m mb-5">
                    <NavLink
                        href={route("dashboard")}
                        active={route().current("dashboard")}
                    >
                        <div className="flex gap-2">
                            <LayoutDashboard size={20} />
                            {expanded && <span>Dashboard</span>}
                        </div>
                    </NavLink>
                </li>

                <span className="ml-2 mb-4 text-sm text-slate-400">List</span>
                {user.role === "super admin" && (
                    <li className="text-m">
                        <NavLink
                            href={route("users.index")}
                            active={route().current("users.index")}
                        >
                            <div className="flex gap-2">
                                <User2 size={20} />
                                {expanded && <span>User</span>}
                            </div>
                        </NavLink>
                    </li>
                )}
                <li className="text-m">
                    <NavLink
                        href={route("farmers.index")}
                        active={route().current("farmers.index")}
                    >
                        <div className="flex gap-2">
                            <Wheat size={20} />
                            {expanded && <span>Farmer</span>}
                        </div>
                    </NavLink>
                </li>
                <li
                    className="text-sm cursor-pointer font-medium leading-5 p-2"
                    onClick={() =>
                        setIsCommodityOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex gap-2 justify-between font-medium leading-5">
                        <div className="flex gap-2">
                            <Leaf size={20} />
                            {expanded && (
                                <span className="font-medium leading-5">
                                    Commodity
                                </span>
                            )}
                        </div>

                        <div className="flex-end">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </li>
                {isCommodityOpen && (
                    <ul
                        className={`relative left-[1rem] transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden inline-block ${
                            isCommodityOpen
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                        }`}
                    >
                        <li className="border-l-2">
                            <NavLink
                                href={route("commodity.index")}
                                active={route().current("commodity.index")}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <HandCoins size={20} />
                                    {expanded && <span>Category</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li className="border-l-2">
                            <NavLink
                                href={route("allocation.type.index")}
                                active={route().current(
                                    "allocation.type.index"
                                )}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>List</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}
                <li
                    className="text-sm cursor-pointer font-medium leading-5 p-2"
                    onClick={() =>
                        setIsAllocationOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex gap-2 justify-between">
                        <div className="flex gap-2">
                            <Handshake size={20} />
                            {expanded && <span>Allocation</span>}
                        </div>

                        <div className="flex-end">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </li>
                {isAllocationOpen && (
                    <ul
                        className={`relative left-[1rem] transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
                            isAllocationOpen
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                        }`}
                    >
                        <li className="border-l-2">
                            <NavLink
                                href={route("allocation.type.index")}
                                active={route().current(
                                    "allocation.type.index"
                                )}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <HandCoins size={20} />
                                    {expanded && <span>Type</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li className="border-l-2">
                            <NavLink
                                href={route("allocations.index")}
                                active={route().current("allocations.index")}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>Records</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li
                    className="text-sm cursor-pointer font-medium leading-5 p-2"
                    onClick={() =>
                        setIsCropDamagesOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex gap-2 justify-between">
                        <div className="flex gap-2">
                            <BugIcon size={20} />
                            {expanded && <span>Damages</span>}
                        </div>

                        <div className="flex-end">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </li>

                {isCropDamagesOpen && (
                    <ul
                        className={`relative left-[1rem] transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
                            isCropDamagesOpen
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                        }`}
                    >
                        <li className="border-l-2">
                            <NavLink
                                href={route("crop.damages.index")}
                                active={route().current("crop.damages.index")}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <HandCoins size={20} />
                                    {expanded && <span>Type</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li className="border-l-2">
                            <NavLink
                                href={route("allocation.type.index")}
                                active={route().current(
                                    "allocation.type.index"
                                )}
                                className="border-l-[1px] "
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>List</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li className="text-m">
                    <NavLink
                        href={route("crop.activity.index")}
                        active={route().current("crop.activity.index")}
                    >
                        <div className="flex gap-2">
                            <Tractor size={20} />
                            {expanded && <span>Crop Activity</span>}
                        </div>
                    </NavLink>
                </li>
                <br />
                <span className="ml-2 mb-4 text-sm text-slate-400">
                    Reports
                </span>
                <li
                    className="text-m"
                    onMouseEnter={() => setIsRecommendationOpen(true)}
                    onMouseLeave={() => setIsRecommendationOpen(false)}
                    onClick={handleRecommendationToggle}
                >
                    <NavLink
                        href={route("recommendations.index")}
                        active={route().current("recommendations.index")}
                    >
                        <div className="flex gap-2">
                            <Brain size={20} />
                            {expanded && <span>Recommendation</span>}
                        </div>
                    </NavLink>
                </li>

                <br />
            </ul>
        </div>
    );
}
