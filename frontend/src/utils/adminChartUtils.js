export function calculateStatusBarData(projects) {
    const statusCounts = {
        "In Progress": 0,
        "To Review": 0,
        "Completed - Pending Payment": 0,
        "Completed Payment": 0
    };

    projects.forEach(p => {
        if (statusCounts[p.status] !== undefined) {
            statusCounts[p.status]++;
        }
    });

    return {
        labels: ["Project Status"],
        datasets: [
            {
                label: "In Progress",
                data: [statusCounts["In Progress"]],
                backgroundColor: "#d6d727",
            },
            {
                label: "To Review",
                data: [statusCounts["To Review"]],
                backgroundColor: "#92cad1",
            },
            {
                label: "Completed - Pending Payment",
                data: [statusCounts["Completed - Pending Payment"]],
                backgroundColor: "#e9724d",
            },
            {
                label: "Completed Payment",
                data: [statusCounts["Completed Payment"]],
                backgroundColor: "#79ccb3",
            },
        ],
    };
}

export function calculateRequestPieData(requests, filter) {
    const now = new Date();
    const getTimeBoundary = (filter) => {
        const d = new Date(now);
        if (filter === "week") d.setDate(d.getDate() - 7);
        else if (filter === "month") d.setMonth(d.getMonth() - 1);
        else if (filter === "year") d.setFullYear(d.getFullYear() - 1);
        return d;
    };

    const boundaryDate = getTimeBoundary(filter);

    let assigned = 0, unassigned = 0, rejected = 0;

    requests.forEach(r => {
        let date = r.createdAt?.seconds
            ? new Date(r.createdAt.seconds * 1000)
            : r.createdAt?._seconds
                ? new Date(r.createdAt._seconds * 1000)
                : new Date(r.createdAt);

        if (date >= boundaryDate) {
            if (r.status === "Rejected") rejected++;
            else if (r.assignedEditorUsername) assigned++;
            else unassigned++;
        }
    });

    return {
        assigned,
        unassigned,
        rejected,
        pieChartData: {
            labels: ["Assigned", "Unassigned", "Rejected"],
            datasets: [
                {
                    label: "Request Distribution",
                    data: [assigned, unassigned, rejected],
                    backgroundColor: ["#b0d7e1", "#f1802d", "#e74c3c"],
                },
            ],
        }
    };
}

// Line chart for weekly earnings
export function calculateEarningsLineData(payments, filter) {
    const now = new Date();
    const labels = [];
    const earningsMap = {};

    let getDateLabel = (d) => d.toLocaleDateString("en-GB");

    if (filter === "week") {
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const label = getDateLabel(date);
            labels.push(label);
            earningsMap[label] = 0;
        }
    } else if (filter === "month") {
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const label = getDateLabel(date);
            labels.push(label);
            earningsMap[label] = 0;
        }
    } else if (filter === "year") {
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - i);
            const label = date.toLocaleString("default", { month: "short", year: "numeric" });
            labels.push(label);
            earningsMap[label] = 0;
        }

        // label function for year
        getDateLabel = (d) => d.toLocaleString("default", { month: "short", year: "numeric" });
    }

    payments.forEach(p => {
        if (p.status === "paid" && p.paidAt) {
            const timestamp = p.paidAt?.seconds || p.paidAt?._seconds;
            const paidDate = new Date(timestamp * 1000);
            const label = getDateLabel(paidDate);

            if (earningsMap[label] !== undefined) {
                earningsMap[label] += p.amount || 0;
            }
        }
    });

    const data = labels.map(label => earningsMap[label]);

    return {
        labels,
        datasets: [
            {
                label: "Earnings (RM)",
                data,
                borderColor: "#b14075",
                backgroundColor: "rgba(177, 64, 117, 0.2)",
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };
}


