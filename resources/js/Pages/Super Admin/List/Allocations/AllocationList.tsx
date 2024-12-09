import CheckBoxDropDown from "@/Components/CheckBoxDropDown";
import List from "@/Components/List";
import DropdownSelect from "@/Components/Listbox";
import PrimaryButton from "@/Components/PrimaryButton";
import Search from "@/Components/Search";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { Download, EyeIcon, Pencil, PlusIcon, Trash } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import FarmerSearch from "@/Components/Listbox";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import { supabase } from "@/supabase";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface Barangay {
    id: number;
    name: string;
}

interface Farmer {
    id: number;
    firstname: string;
    lastname: string;
}

interface Commodity {
    id: number;
    name: string;
}

interface NewAllocation {
    allocation_type: string;
    brgy_id: string;
    commodity_id: string;
    date_received: string;
    farmer_id: number | null;
    received: string;
}

type Allocation = {
    id: number;
    allocation_type: string;
    farmer: {
        id: number;
        firstname: string;
        lastname: string;
    };
    received: string;
    date_received: Date;
    commodity: {
        id: number;
        name: string;
    };
    barangay: {
        id: number;
        name: string;
    };
};

type PaginatedAllocation = {
    data: Allocation[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

interface AllocationProps extends PageProps {
    allocation: PaginatedAllocation;
    barangays: Barangay[];
    commodities: Commodity[];
    farmers: Farmer[];
}

export default function AllocationList({
    auth,
    allocation = {
        data: [],
        total: 0,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        next_page_url: null,
        prev_page_url: null,
    },
    barangays = [],
    commodities = [],
    farmers = [],
}: AllocationProps) {
    const allocationData = allocation?.data || [];
    const [allocations, setAllocations] = useState<AllocationProps[]>();
    const [loading, setLoading] = useState(false);
    const rows = allocationData.map((allocation: Allocation) => ({
        id: allocation.id,
        allocation_type: allocation.allocation_type, // Include this
        farmer_name: `${allocation.farmer?.firstname || "N/A"} ${
            allocation.farmer?.lastname || "N/A"
        }`,
        commodity_name: allocation.commodity?.name || "N/A",
        brgy_name: allocation.barangay?.name || "N/A", // Include this
        received: allocation.received,
        date_received: allocation.date_received,
    }));

    const fetchAllocationData = () => {
        setLoading(true);

        axios
            .get("/allocations/data")

            .then((response) => {
                const data = response.data;
                setAllocations(data);
                console.log("Allocations data: ", allocations);
            })
            .catch((error) => {
                console.error("error: ", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAllocationData();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "#", width: 90 },
        {
            field: "allocation_type",
            headerName: "Type",
            width: 100,
        },
        { field: "farmer_id", headerName: "First name", width: 120 },

        {
            field: "brgy_id",
            headerName: "Barangay",
            width: 100,
            // valueGetter: (value, row) => {
            //     return farmer.barangay?.name || "Unknown";
            // },
        },

        { field: "commodity_id", headerName: "commodity_id", width: 70 },
        {
            field: "received",
            headerName: "Received",
            type: "boolean",
            width: 50,
        },
        { field: "date_received", headerName: "Date", width: 100 },
        {
            field: "actions",
            headerName: "Actions",
            width: 90,
            renderCell: (params) => (
                <div>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <EyeIcon size={20} color="blue" />
                    </button>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <Pencil size={20} color="green" />
                    </button>
                    <button onClick={() => handleDelete(params.row.id)}>
                        <Trash size={20} color="red" />
                    </button>
                </div>
            ),
        },
    ];

    const [filteredRows, setFilteredRows] = useState(rows);
    const [yearSelectValue, setYearSelectValue] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = allocation?.total || 0;
    const itemsPerPage = 20;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAllocation, setNewAllocation] = useState<NewAllocation>({
        allocation_type: "",
        brgy_id: "",
        commodity_id: "",
        date_received: "",
        farmer_id: null,
        received: "",
    });

    const yearOptions = [
        { label: "2024", value: "2024" },
        { label: "2023", value: "2023" },
        { label: "2022", value: "2022" },
        { label: "2021", value: "2021" },
    ];

    const handleSearch = (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredData = rows.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(lowerCaseQuery)
            )
        );
        setFilteredRows(filteredData);
    };

    const handleYearSelectChange = (newValue: any) => {
        setYearSelectValue(newValue);
    };

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);

        try {
            const response = await axios.get(`/allocation?page=${page}`, {
                headers: {
                    "X-Inertia": true,
                    Accept: "application/json",
                },
            });

            const paginatedDamage = response.data;

            if (paginatedDamage && paginatedDamage.data) {
                const updatedRows = paginatedDamage.data.map(
                    (allocation: Allocation) => ({
                        id: allocation.id,
                        allocation_type: allocation.allocation_type,
                        farmer_name: `${
                            allocation.farmer?.firstname || "N/A"
                        } ${allocation.farmer?.lastname || "N/A"}`,
                        commodity_name: allocation.commodity?.name || "N/A",
                        brgy_name: allocation.barangay?.name || "N/A",
                        date_received: allocation.date_received,
                        received: allocation.received,
                    })
                );
                setFilteredRows(updatedRows);
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    };

    const handleEdit = (allocation: Allocation) => {
        setSelectedAllocation(allocation);
        setIsUpdateModalOpen(true);
        console.log(selectedAllocation);
    };

    const handleDelete = async (allocation: Allocation) => {
        if (
            window.confirm(
                "Are you sure you want to delete this allocation record?"
            )
        ) {
            try {
                await router.delete(`/allocations/destroy/${allocation.id}`);
                toast.success("allocation deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            } catch (error) {
                toast.error("Failed to delete allocation");
            }
        }
    };

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewAllocation({
            ...newAllocation,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation({
            ...newAllocation,
            [e.target.name]: e.target.value,
        });
    };

    const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation((prev) => ({
            ...prev,
            commodity_id: e.target.value,
        }));
    };

    const handleBrgyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation((prev) => ({
            ...prev,
            brgy_id: e.target.value,
        }));
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (
            !newAllocation.farmer_id ||
            !newAllocation.allocation_type ||
            !newAllocation.received ||
            !newAllocation.brgy_id
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();

        console.log("Submitting damage data:", newAllocation);
        (Object.keys(newAllocation) as (keyof typeof newAllocation)[]).forEach(
            (key) => {
                const value = newAllocation[key];
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            }
        );

        try {
            await axios.post("/allocations/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Allocation added successfully");
            closeModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error adding damage:", error.response.data);
                toast.error(
                    `Failed to add damage: ${
                        error.response.data.message || "Validation error"
                    }`
                );
            } else {
                toast.error("Failed to add damage");
            }
        }
    };

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [selectedFarmer, setSelectedFarmer] = useState(null);

    const farmerOptions = farmers.map((farmer) => ({
        label: `${farmer.firstname} ${farmer.lastname}`,
        value: farmer.id.toString(),
    }));

    const [selectedAllocation, setSelectedAllocation] =
        useState<Allocation | null>(null);

    const handleView = (allocation: Allocation) => {
        setSelectedAllocation(allocation);
        openModal();
    };

    const handleFarmerSelect = (farmer: Farmer) => {
        setNewAllocation((prev) => ({
            ...prev,
            farmer_id: farmer.id,
        }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAllocation) {
            console.error("No allocation selected");
            toast.error("No allocation selected");
            return;
        }

        const updates = {
            allocation_type: selectedAllocation.allocation_type,
            farmer_id: selectedAllocation.farmer?.id,
            received: selectedAllocation.received,
            date_received: selectedAllocation.date_received,
            commodity_id: selectedAllocation.commodity?.id,
            brgy_id: selectedAllocation.barangay?.id || "",
        };

        try {
            const { data, error } = await supabase
                .from("allocation")
                .update(updates)
                .eq("id", selectedAllocation.id);

            console.log(selectedAllocation);

            if (error) {
                console.error("Error updating allocation:", error);
            } else {
                console.log("allocation updated successfully:", data);
                toast.success("allocation updated successfully!");
                setIsUpdateModalOpen(false);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Allocation Management
                </h2>
            }
        >
            <Head title="Allocation Management" />
            <ToastContainer />

            <Modal show={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl mb-2">Add New Farmer</h2>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-gap">
                        <TextInput
                            name="allocation_type"
                            value={newAllocation.allocation_type}
                            onChange={handleInputChange}
                            placeholder="allocation_type"
                        />
                        <FarmerSearch
                            farmers={farmers}
                            onFarmerSelect={handleFarmerSelect}
                        />
                    </div>

                    <div className="flex gap-5">
                        <select
                            name="received"
                            value={newAllocation.received}
                            onChange={handleSelectChange}
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="" disabled>
                                Received?
                            </option>

                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                        <select
                            name="brgy_id"
                            value={newAllocation.brgy_id}
                            onChange={handleBrgyChange}
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Barangay</option>
                            {barangays.map((barangay) => (
                                <option key={barangay.id} value={barangay.id}>
                                    {barangay.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-5">
                        <select
                            name="commodity_id"
                            value={newAllocation.commodity_id}
                            onChange={handleCommodityChange}
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="" disabled>
                                Commodity
                            </option>
                            {commodities.map((commodity) => (
                                <option key={commodity.id} value={commodity.id}>
                                    {commodity.name}
                                </option>
                            ))}
                        </select>
                        <br />
                        <input
                            type="date"
                            name="date_received"
                            value={newAllocation.date_received}
                            onChange={(e) =>
                                setNewAllocation({
                                    ...newAllocation,
                                    date_received: e.target.value,
                                })
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                            required
                        />
                    </div>

                    <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
                </form>
            </Modal>
            <div className="flex justify-between mb-3">
                <div className="flex gap-5">
                    <Search onSearch={handleSearch} />
                    <CheckBoxDropDown
                        options={yearOptions}
                        onChange={handleYearSelectChange}
                        value={yearSelectValue}
                        placeholder="Year"
                        isMulti={true}
                    />
                </div>
                <div className="flex gap-5">
                    <PrimaryButton className="border text-sm justify-center content-center rounded-lg align-items-center text-white align-middle">
                        <span className="flex gap-2">
                            <Download size={18} />
                            Export
                        </span>
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={openModal}
                        className="text-sm justify-center align-content-center rounded-lg text-white"
                    >
                        <span className="flex gap-2">
                            <PlusIcon size={18} />
                            Add new
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <span className="text-sm text-slate-300">
                Total Allocations: {allocation.total}
            </span>

            <Box
                sx={{ height: "450px", padding: "10px", borderRadius: "10px" }}
            >
                <DataGrid
                    rows={allocations}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 50 },
                        },
                    }}
                    pageSizeOptions={[50, 100, 200, 350, 500]}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                        },
                        padding: "10px",
                        borderRadius: "1.5rem",
                    }}
                />
            </Box>

            <Modal
                show={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
            >
                <h2 className="text-xl mb-2">Update Allocation</h2>

                {selectedAllocation && (
                    <form onSubmit={handleUpdate}>
                        <div className="flex flex-gap">
                            <TextInput
                                name="allocation_type"
                                value={selectedAllocation.allocation_type}
                                onChange={handleInputChange}
                                placeholder="allocation_type"
                            />
                            <FarmerSearch
                                farmers={farmers}
                                onFarmerSelect={handleFarmerSelect}
                            />
                        </div>

                        <div className="flex gap-5">
                            <select
                                name="received"
                                value={selectedAllocation.received}
                                onChange={handleSelectChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Received?
                                </option>

                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            <select
                                name="brgy_id"
                                value={selectedAllocation.barangay?.id}
                                onChange={handleBrgyChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Barangay</option>
                                {barangays.map((barangay) => (
                                    <option
                                        key={barangay.id}
                                        value={barangay.id}
                                    >
                                        {barangay.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-5">
                            <select
                                name="commodity_id"
                                value={selectedAllocation.commodity?.id}
                                onChange={handleCommodityChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Commodity
                                </option>
                                {commodities.map((commodity) => (
                                    <option
                                        key={commodity.id}
                                        value={commodity.id}
                                    >
                                        {commodity.name}
                                    </option>
                                ))}
                            </select>
                            <br />
                            {/* <input
                                type="date"
                                name="date_received"
                                value={
                                    selectedAllocation.date_received
                                        ? selectedAllocation.date_received
                                              .toISOString()
                                              .split("T")[0]
                                        : ""
                                }
                                onChange={(e) =>
                                    setNewAllocation({
                                        ...selectedAllocation,
                                        date_received: e.target.value,
                                    })
                                }
                                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                            /> */}
                        </div>

                        <PrimaryButton type="submit">Update</PrimaryButton>
                    </form>
                )}
            </Modal>
        </Authenticated>
    );
}
