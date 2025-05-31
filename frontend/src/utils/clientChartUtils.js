export function calculateRequestStatusData(requests) {
    const statusCounts = {
        Pending: 0,
        Accepted: 0,
        Rejected: 0,
    };

    requests.forEach((r) => {
        if (r.status === "Pending") statusCounts.Pending++;
        else if (r.status === "Rejected") statusCounts.Rejected++;
        else statusCounts.Accepted++;
    });

    return {
        labels: ["Accepted", "Pending", "Rejected"],
        datasets: [
            {
                label: "Request Status",
                data: [
                    statusCounts.Accepted,
                    statusCounts.Pending,
                    statusCounts.Rejected,
                ],
                backgroundColor: ["#8BC34A", "#FFC107", "#F44336"],
                borderColor: "#ffffff",
                borderWidth: 1,
            },
        ],
    };
}
