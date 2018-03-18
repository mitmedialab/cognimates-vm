


const Scratch = window.Scratch = window.Scratch || {};

const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/';
const PROJECT_SERVER = 'https://cdn.projects.scratch.mit.edu/';

const loadProject = function () {
    let id = location.hash.substring(1);
    if (id.length < 1 || !isFinite(id)) {
        id = '119615668';
    }
    Scratch.vm.downloadProjectId(id);
};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project file.
 */
const getProjectUrl = function (asset) {
    const assetIdParts = asset.assetId.split('.');
    const assetUrlParts = [PROJECT_SERVER, 'internalapi/project/', assetIdParts[0], '/get/'];
    if (assetIdParts[1]) {
        assetUrlParts.push(assetIdParts[1]);
    }
    return assetUrlParts.join('');
};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
const getAssetUrl = function (asset) {
    const assetUrlParts = [
        ASSET_SERVER,
        'internalapi/asset/',
        asset.assetId,
        '.',
        asset.dataFormat,
        '/get/'
    ];
    return assetUrlParts.join('');
};

function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

//Jibo UTILS
function getBase64FromImageUrl(url,cb) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =1280;
        canvas.height =720;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/jpeg");
        cb(dataURL);

    };

    img.src = url;
}

function populateMedia(callback)
{
    //populate images
    $.getJSON( "./src/playground/assets/image-list.json", {
        tagmode: "any",
        format: "json"
    })
    .done(function( data ) {
        console.log(data);
        if (data.length < 1){
            Blockly.Blocks['jibo_image_menu'].menuGenerator = [["jibo","no images"]];
        }else {
            Blockly.Blocks['jibo_image_menu'].menuGenerator = data;
        }
        //populate animations
        $.getJSON( "./src/playground/assets/animdb.json", {
            tagmode: "any",
            format: "json"
        })
        .done(function( data ) {
            let animations = [];
            let emojis = [];
            let eye = [];
            let jibo_sounds = [];
            for (a in data) {
                if (a.indexOf("moji")>=0){
                    emojis.push([a,data[a].path.split("animations/")[1]]);
                }else if (a.indexOf("eye")>=0 || a.indexOf("lance")>=0){
                    eye.push([a,data[a].path.split("animations/")[1]]);
                }else if (a.indexOf("SSA")>=0 || a.indexOf("sfx")>=0 || a.indexOf("ei_")>=0 || a.indexOf("music_")==0){
                    jibo_sounds.push([a,data[a].path.split("animations/")[1]]);
                }else if (a.indexOf("hj-")>=0 || a.indexOf("ds-")>=0 || a.indexOf("alert-")>=0){
                    //not usefull animations
                }else{
                    animations.push([a,data[a].path.split("animations/")[1]]);
                }

            }
            Blockly.Blocks['jibo_animation_menu'].menuGenerator = animations;
            Blockly.Blocks['jibo_emojis_menu'].menuGenerator = emojis;
            Blockly.Blocks['jibo_eye_menu'].menuGenerator = eye;
            Blockly.Blocks['jibo_sounds_menu'].menuGenerator = jibo_sounds;
            if(callback) {
                callback();
            }
            //populate sounds
            $.getJSON( "./src/playground/assets/audio-list.json", {
                tagmode: "any",
                format: "json"
            })
            .done(function( data ) {
                console.log(data);
                if (data.length < 1){
                    Blockly.Blocks['sound_sounds_menu'].menuGenerator = [["jibo","no sounds"]];
                }else {
                    Blockly.Blocks['sound_sounds_menu'].menuGenerator = data;
                }
            });

        });

    });
}


window.onload = function () {

    // Lots of global variables to make debugging easier
    // Instantiate the VM.
    const vm = new window.VirtualMachine();
    Scratch.vm = vm;

    // const storage = new Scratch.Storage();
    // const AssetType = storage.AssetType;
    // storage.addWebSource([AssetType.Project], getProjectUrl);
    // storage.addWebSource([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
    // vm.attachStorage(storage);

    };
    loadProject();

    const audioEngine = new window.AudioEngine();
    vm.attachAudioEngine(audioEngine);

    // Instantiate scratch-blocks and attach it to the DOM.
    const workspace = window.Blockly.inject('blocks', {
        media: './playground/media/',
        toolboxPosition: 'end',
        horizontalLayout: true,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 0.75
        },
        colours: {
            workspace: '#334771',
            flyout: '#283856',
            scrollbar: '#24324D',
            scrollbarHover: '#0C111A',
            insertionMarker: '#FFFFFF',
            insertionMarkerOpacity: 0.3,
            fieldShadow: 'rgba(255, 255, 255, 0.3)',
            dragShadowOpacity: 0.6
        }
    });
    Scratch.workspace = workspace;

    // Attach scratch-blocks events to VM.
    workspace.addChangeListener(vm.blockListener);
    workspace.addChangeListener(vm.variableListener);
    const flyoutWorkspace = workspace.getFlyout().getWorkspace();
    flyoutWorkspace.addChangeListener(vm.flyoutBlockListener);
    flyoutWorkspace.addChangeListener(vm.monitorBlockListener);


    // Playground data tabs.
    // Block representation tab.
    var prev_wblocks = null;

    const updateBlockExplorer = function (blocks) {
        var wblocks = [];
        var blockevent = false;
        if (typeof mission !== 'undefined') {
            if (!mission_initialized){
                missionCommander(wblocks);
            }
            for (var i in blocks['_blocks']) {
                var block = {
                    opcode: null,
                    next: null
                }

                block.opcode = blocks['_blocks'][i]['opcode'];

                if (blocks['_blocks'][i]['next'] != null) {
                    block.next = blocks['_blocks'][blocks['_blocks'][i]['next']]['opcode'];
                }
                wblocks.push(block);
            }
            if (vm.blockevent != null) {
                if (('blockId' in vm.blockevent) && ('newCoordinate' in vm.blockevent)) {
                    blockevent = true;
                }
            }
            if ((JSON.stringify(prev_wblocks) !== JSON.stringify(wblocks))  && blockevent) {
                prev_wblocks = JSON.parse(JSON.stringify(wblocks));

                missionCommander(wblocks);
            }
        }
    };

    // Thread representation tab.
    let cachedThreadJSON = '';
    const updateThreadExplorer = function (newJSON) {
        if (newJSON !== cachedThreadJSON) {
            cachedThreadJSON = newJSON;

        }
    };

    // Only request data from the VM thread if the appropriate tab is open.
    Scratch.exploreTabOpen = true;
    const getPlaygroundData = function () {
        vm.getPlaygroundData();
        if (Scratch.exploreTabOpen) {
            window.requestAnimationFrame(getPlaygroundData);
        }
    };


    // VM handlers.
    // Receipt of new playground data (thread, block representations).
    vm.on('playgroundData', data => {
        updateThreadExplorer(data.threads);
        updateBlockExplorer(data.blocks);
    });

    // Receipt of new block XML for the selected target.
    vm.on('workspaceUpdate', data => {
        workspace.clear();
        const dom = window.Blockly.Xml.textToDom(data.xml);
        window.Blockly.Xml.domToWorkspace(dom, workspace);
    });


    // Feedback for stacks and blocks running.
    vm.on('SCRIPT_GLOW_ON', data => {
        workspace.glowStack(data.id, true);
    });
    vm.on('SCRIPT_GLOW_OFF', data => {
        workspace.glowStack(data.id, false);
    });
    vm.on('BLOCK_GLOW_ON', data => {
        workspace.glowBlock(data.id, true);
    });
    vm.on('BLOCK_GLOW_OFF', data => {
        workspace.glowBlock(data.id, false);
    });
    vm.on('VISUAL_REPORT', data => {
        workspace.reportValue(data.id, data.value);
    });


    // Feed keyboard events as VM I/O events.
    document.addEventListener('keydown', e => {
        // Don't capture keys intended for Blockly inputs.
        if (e.target !== document && e.target !== document.body) {
            return;
        }
        Scratch.vm.postIOData('keyboard', {
            keyCode: e.keyCode,
            isDown: true
        });
        e.preventDefault();
    });
    document.addEventListener('keyup', e => {
        // Always capture up events,
        // even those that have switched to other targets.
        Scratch.vm.postIOData('keyboard', {
            keyCode: e.keyCode,
            isDown: false
        });
        // E.g., prevent scroll.
        if (e.target !== document && e.target !== document.body) {
            e.preventDefault();
        }
    });

    // Run threads
    vm.start();

    // Inform VM of animation frames.
    const animate = function () {
        //stats.update();
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Handlers for green flag and stop all.
    document.getElementById('greenflag').addEventListener('click', () => {
        vm.greenFlag();
    });
    document.getElementById('stopall').addEventListener('click', () => {
        vm.stopAll();
    });

    setTimeout(clearVariables,1000);
    //tabImportExport.style.display = 'block';
    Scratch.exploreTabOpen = true;
    setTimeout(getPlaygroundData,1000);

    populateMedia();



function clearVariables() {
    var variables = window.Scratch.workspace.getAllVariables();
    variables.forEach(variable => {
        window.Scratch.workspace.deleteVariable(variable.name);
    });
}
