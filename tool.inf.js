
exports['gi0.pinf.it/core/v0/tool'] = async function (workspace, LIB) {

    return async function (instance) {

        if (/\/exports\/v0$/.test(instance.kindId)) {

// console.log('EXPORTS instance', instance);

//throw new Error("This should be instanciated twice. i.e. the interface should be instanciated every time it is mapped/declared.");


            return async function (invocation, HELPERS) {

// console.log('EXPORTS invocation', invocation);
// console.log("invocation.config", invocation.config);
                
                const step = new HELPERS.Step(instance, invocation, async function (defaults) {

                    const inputPaths = [];

                    const doc = LIB.LODASH.merge({}, defaults || {});

                    await LIB.Promise.mapSeries(Object.keys(invocation.config), async function (pointer) {
                        
                        const path = LIB.PATH.join(invocation.dirs.dist, invocation.config[pointer].toString());

                        inputPaths.push(path);

                        try {
    
                            const hash = LIB.CRYPTO.createHash('sha1').update(
                                await LIB.FS.readFile(path, 'utf8')
                            ).digest('hex');
    
                            let meta = {
                                path: '.' + LIB.PATH.join('/', invocation.config[pointer].toString()),
                                size: (await LIB.FS.stat(path)).size,
                                hash: `sha1:${hash}`
                            };

                            meta = LIB.LODASH.merge(LIB.LODASH.get(doc, pointer.split('/'), {}), meta);

                            LIB.LODASH.set(doc, pointer.split('/'), meta);
                        } catch (err) {
                            err.message += ` (while generating 'exports.json' entry for ${path} at ${invocation.pwd})`;
                            throw err;
                        }
                    });

// console.log("doc", doc);

                    return {
                        body: JSON.stringify(doc, null, 4),
                        meta: {
                            inputPaths: inputPaths.map(function (path) {
                                return LIB.PATH.relative(invocation.pwd, path);
                            })
                        }
                    };
                });

                step.watchValues(LIB.LODASH.values(invocation.config));
                await step.forValue(invocation.value);

                return {
                    value: step.getValueProvider()
                };
            };
        }
    };
}
