import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 3600, // Cache expires after 1 hour (3600 seconds)
    checkperiod: 600,  // Check for expired keys every 10 minutes
    useClones: false  // Faster, since we don't mutate results
});

export default cache;