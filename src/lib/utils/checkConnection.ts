/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import * as url from 'url';

export const checkConnection = (inputUrl: string): Promise<never> => {
    const protocols = { 'http:': http, 'https:': https };
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        protocols[url.parse(inputUrl).protocol].get(inputUrl, (res) => resolve(res)).on('error', (err) => reject(err));
    });
};

export function portInUse(host: string, port: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const server = net.createServer((socket) => {
            socket.write('Echo server\r\n');
            socket.pipe(socket);
        });

        server.listen(port, host);
        server.on('error', () => {
            resolve(true);
        });
        server.on('listening', () => {
            server.close();
            resolve(false);
        });
    });
}
