const Logger = {
    info: (...message) => {
        var timestamp = new Date().toISOString();
        console.log(timestamp, ...message);
    },
    error: (...message)=> {
        var timestamp = new Date().toISOString();
        console.error(timestamp, ...message);
    }
}

export default Logger;