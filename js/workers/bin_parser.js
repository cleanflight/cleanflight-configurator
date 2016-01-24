'use strict';

// input = string
// result = if bin file is valid, result is an object
//          if bin file wasn't valid (length 0), result will be false
function read_bin_file(buf) {
    if (!buf.length)
        postMessage(false);

    var data = new Uint8Array(buf);

    var result = {
        data:                   [],
        end_of_file:            true,
        bytes_total:            data.length,
        start_linear_address:   0x8000000 // start of STM32 flash, i love assumptions
    };

    var block_size = 2048; // the flashing code assumes this... sigh

    for (var address = 0; address < result.bytes_total; address += block_size) {
        if (address + block_size > result.bytes_total)
            block_size = result.bytes_total - address;
        result.data.push({
            "data": data.slice(address, address + block_size),
            "bytes": block_size,
            "address": result.start_linear_address + address
        });
    }

    postMessage(result);
}

function microtime() {
    var now = new Date().getTime() / 1000;

    return now;
}

onmessage = function(event) {
    var time_parsing_start = microtime(); // track time

    read_bin_file(event.data);

    console.log('BIN_PARSER - File parsed in: ' + (microtime() - time_parsing_start).toFixed(4) + ' seconds');

    // terminate worker
    close();
};