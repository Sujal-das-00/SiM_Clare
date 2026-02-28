export function structureProducts(products = []) {

    if (!Array.isArray(products)) {
        throw new Error("Products must be an array");
    }

    const catalog = Object.create(null);

    for (const product of products) {

        if (!product || !product.productID) continue;

        const baseName = String(product.productName || "")
            .replace(/\s+/g, " ")
            .replace(/\(Daily.*?\)/i, "")
            .trim();

        if (!baseName) continue;

        const validity = Number(product.productValidityDays);
        const basePrice = Number(product.productPrice);
        const dataAmount = Number(product.productDataAllowance);
        const dataUnit = product.dataAllowanceUnit;

        if (!validity || !dataAmount || !dataUnit) continue;

        const dataKey = `${dataAmount}${dataUnit}`;

        // Initialize SIM category
        if (!catalog[baseName]) {
            catalog[baseName] = {
                type: product.productType,   // ✅ set once
                plans: Object.create(null)
            };
        }

        // Initialize data bucket
        if (!catalog[baseName].plans[dataKey]) {
            catalog[baseName].plans[dataKey] = [];
        }

        // Push plan (without type duplication)
        catalog[baseName].plans[dataKey].push({
            productID: product.productID,
            validity,
            basePrice,
            currency: product.productCurrency
        });
    }

    // Sort validity inside each data bucket
    for (const simName in catalog) {
        const sim = catalog[simName];

        for (const dataKey in sim.plans) {
            sim.plans[dataKey].sort((a, b) => a.validity - b.validity);
        }

        // Sort data categories numerically
        sim.plans = Object.fromEntries(
            Object.entries(sim.plans)
                .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        );
    }

    return catalog;
}