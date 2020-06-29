
exports['gi0.PINF.it/build/v0'] = async function (LIB, CLASSES) {

    class BuildStep extends CLASSES.BuildStep {

        async onBuild (result, build, target, instance, home, workspace) {

            const doc = LIB.LODASH.merge({}, build.config);

            let waitfor = Promise.resolve();
            LIB.TRAVERSE(doc).forEach(function () {
                const node = this.node;
                if (
                    typeof node === 'object' &&
                    typeof node.path === 'string'
                ) {
                    waitfor = waitfor.then(async function () {

                        // TODO: Use streaming hashing function.
                        const path = LIB.PATH.join(instance.path, node.path);
                        result.inputPaths[path] = true;
                        const hash = LIB.CRYPTO.createHash('sha1').update(
                            await LIB.FS.readFile(path, 'utf8')
                        ).digest('hex');

                        node.path = './' + LIB.PATH.relative(LIB.PATH.dirname(target.path), path);
                        node.size = (await LIB.FS.stat(path)).size;
                        node.hash = `sha1:${hash}`;
                    });
                }
            });
            await waitfor;

            result.outputPaths[target.path] = true;
            await LIB.FS.outputFile(target.path, JSON.stringify(doc, null, 4), 'utf8');            
        }
    }

    return BuildStep;    
}
