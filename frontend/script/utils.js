export function getStatusAndColor(percent) {
    if (percent < 20) {
        return { status: "Excellent", color: "bg-emerald-500", text: "text-emerald-500" };
    } else if (percent < 50) {
        return { status: "Good", color: "bg-emerald-500", text: "text-emerald-500" };
    } else if (percent < 80) {
        return { status: "Moderate", color: "bg-yellow-500", text: "text-yellow-500" };
    } else if (percent < 100) {
        return { status: "Warning", color: "bg-yellow-500", text: "text-yellow-500" };
    } else {
        return { status: "Over Budget", color: "bg-red-500", text: "text-red-500" };
    }
}