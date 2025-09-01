import { format } from "date-fns";

export const dayStyle = a => {
    const day = a.getDay() == 5 || a.getDay() == 6;
    return day ? "sday" : "";
};

function hoursTemplate(a, b) {
    return `${format(a, "HH:mm")} - ${format(b, "HH:mm")}`;
}

export const taskTypes = [
    { id: "task", label: "Anime" },
    { id: "summary", label: "Summary task" },
    { id: "milestone", label: "Milestone" },
    { id: "urgent", label: "Urgent" },
    { id: "narrow", label: "Narrow" },
    { id: "progress", label: "Progress" },
    { id: "round", label: "Rounded" },
];

export const zoomConfig = {
    level: 3,
    levels: [
        {
            minCellWidth: 200,
            maxCellWidth: 400,
            scales: [{ unit: "year", step: 1, format: "yyyy" }],
        },
        {
            minCellWidth: 150,
            maxCellWidth: 400,
            scales: [
                { unit: "year", step: 1, format: "yyyy" },
                { unit: "quarter", step: 1, format: "QQQQ" },
            ],
        },
        {
            minCellWidth: 250,
            maxCellWidth: 350,
            scales: [
                { unit: "quarter", step: 1, format: "QQQQ" },
                { unit: "month", step: 1, format: "MMMM yyy" },
            ],
        },
        {
            minCellWidth: 100,
            scales: [
                { unit: "month", step: 1, format: "MMMM yyy" },
                { unit: "week", step: 1, format: "'week' w" },
            ],
        },
        {
            maxCellWidth: 200,
            scales: [
                { unit: "month", step: 1, format: "MMMM yyy" },
                { unit: "day", step: 1, format: "d", css: dayStyle },
            ],
        },
        {
            minCellWidth: 25,
            maxCellWidth: 100,
            scales: [
                { unit: "day", step: 1, format: "MMM d", css: dayStyle },
                { unit: "hour", step: 6, format: hoursTemplate },
            ],
        },
        {
            maxCellWidth: 120,
            scales: [
                { unit: "day", step: 1, format: "MMM d", css: dayStyle },
                { unit: "hour", step: 1, format: "HH:mm" },
            ],
        },
    ],
};