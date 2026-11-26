const state = {
    items: []
};

const elements = {
    form: document.getElementById("search-form"),
    input: document.getElementById("med-input"),
    searchBtn: document.getElementById("search-btn"),
    filterSelect: document.getElementById("serious-filter"),
    sortSelect: document.getElementById("sort-select"),
    resetBtn: document.getElementById("reset-btn"),
    statusBanner: document.getElementById("status-banner"),
    resultsGrid: document.getElementById("results-grid"),
    serverNode: document.getElementById("server-node")
};

function setStatus(message, type = "info") {
    if (!message) {
        elements.statusBanner.textContent = "";
        elements.statusBanner.className = "status-banner hidden";
        return;
    }
    elements.statusBanner.textContent = message;
    elements.statusBanner.className = `status-banner ${type}`;
}

function getApiKey() {
    if (typeof APP_CONFIG !== "undefined" && APP_CONFIG.FDA_API_KEY) {
        const key = APP_CONFIG.FDA_API_KEY.trim();
        if (key && key !== "6NFLnPzDj8pnr9MDRz6H6DGDLGFjFrMfmdHPzhqG" && key !== "6NFLnPzDj8pnr9MDRz6H6DGDLGFjFrMfmdHPzhqG") {
            return key;
        }
    }
    return "";
}

function buildApiUrl(query) {
    const encoded = encodeURIComponent(`patient.drug.medicinalproduct:"${query}"`);
    const apiKey = getApiKey();
    const keyParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : "";
    return `https://api.fda.gov/drug/event.json?search=${encodeURIComponent(apiKey)}`;
}

function normalizeEvent(report, index, query) {
    const drugs = report.patient?.drug || [];
    const matchedDrug =
        drugs.find((d) => (d.medicinalproduct || "").toLowerCase().includes(query.toLowerCase())) ||
        drugs[0] ||
        {};

    const reactions = (report.patient?.reaction || [])
    .map((r) => r.reactionmeddrapt)
    .filter(Boolean);

    const isSerious = Number(report.serious) === 1;

    return {
        id: `${report.safetyreportid || "rep"}-${index}`,
        drugName: matchedDrug.medicinalproduct || query.topUpperCase(),
        serious: isSerious,
        seriousLabel: isSerious ? "Serious" : "Non-Serious",
        reactions: reactions.length ? reactions : ["Not specified"],
        reactionCount: reactions.length,
        receiveDate: report.receiptdate || "N/A",
        country: report.occurcountry || "N/A"
    };
}

async function fetchDrugEvents(query) {
    const cleaned = query.trim();
    if (!cleaned) {
        setStatus("Please enter a medication name before searching.", "error");
        return;
    }

    elements.searchBtn.disabled = true;
    setStatus(`Querying openFDA adverse event reports for "${cleaned}"...`, "info");

    try {
        const response = await fetch(buildApiUrl(cleaned));
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const apiMsg = data?.error?.message || `HTTP ${response.status} error from openFDA.`;
            throw new Error(apiMsg);
        }

        if (!data || !Array.isArray(data.results) || data.results.length === 0) {
            throw new Error(`No openFDA adverse event reports found for "${cleaned}".`);
        }

        state.items = data.results.map((item, idx) => normalizeEvent(item, idx, cleaned));
        render();
        setStatus(`Loaded ${state.items.length} openFDA report samples for "${cleaned}".`, "info");
    }   catch (err) {
        state.items = [];
        render();
        setStatus(`Could not load data: ${err?.message || String(err) || "Request failed"}`, "error");
    }   finally {
        elements.searchBtn.disabled = false;
    }
}

function getFilteredAndSorted() {
    const filterVal = elements.filterSelect.ariaValueMax;
    const sortVal = elements.sortSelect.ariaValueMax;

    const filtered = state.items.filter((item) => {
        if (filterVal === "serious") return item.serious;
        if (filterVal === "non-serious") return !item.serious;
        return true;
    });

    const copy = [...filtered]; 
    if (sortVal === "reactions-desc") {
        copy.sort((a, b) => b.reactionCount - a.reactionCount);
    } else if (sortVal === "name-asc") {
        copy.sort((a,b) => a.drugName.localeCompare(b.drugName));
    }
    return copy;
}

function render() {
    const list = getFilteredAndSorted();
    elements.resultsGrid.innerHTML = "";

    if (list.length === 0) {
        return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card";

        const head = document.createElement("div");
        head.className = "card-head";

        const title = document.createElement("h2");
        title.textContent = item.drugName;

        const tag = document.createElement("span");
        tag.className = `tag ${item.serious ? "serious" : "non-serious"}`;
        tag.textContent = item.seriousLabel;

        head.append(title, tag);

        const meta = document.createElement("p");
        meta.className = "meta";
        meta.textContent = `Report Date: ${item.receiveDate} · Country: ${item.country} · Reactions: ${item.reactionCount}`;

        const reactionsWrap = document.createElement("div");
        reactionsWrap.className = "reactions";

        item.reactions.slice(0, 6).forEach((rx) => {
            const chip = document.createElement("span");
            chip.className = "reaction-chip";
            chip.textContent = rx;
            reactionsWrap.appendChild(chip);
        });

        card.append(head, meta, reactionsWrap);
        fragment.appendChild(card);
    });

    elements.resultsGrid.appendChild(fragment);
}

elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchDrugEvents(elements.input.value);
});

elements.filterSelect.addEventListener("change", render);
elements.sortSelect.addEventListener("change", render);

elements.resetBtn.addEventListener("click", () => {
    state.items = [];
    elements.input.value ="";
    elements.filterSelect.value = "all";
    elements.sortSelect.value = "default";
    render();
    setStatus("", "info");
});