module.exports = (dataOwnersDistribution) => {
    const chart = {
        type: 'bar',
        data: {
            labels: dataOwnersDistribution.map(row => row.tokenCount),
            datasets: [{
                label: 'Owners Count',
                data: dataOwnersDistribution.map(row => row.ownerCount),
                borderColor: '#C75580',
                backgroundColor: '#CA7C9A',
                borderWidth: 2,
                borderRadius: 5,
                borderSkipped: 'end',
            }],
        },
    };

    // Convert the JSON chart specification into a string
    const encodedChart = encodeURIComponent(JSON.stringify(chart));

    // Put the encoded chart into a QuickChart URL
    const chartUrl = `https://quickchart.io/chart?c=${encodedChart}`;

    return chartUrl;
};
