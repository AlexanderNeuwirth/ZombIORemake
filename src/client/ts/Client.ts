import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { IZIRServerCommunications, IZIREntity } from "./globalInterfaces/MainInterfaces";
import { ZIREntityBase } from "./baseObjects/EntityBase";
import { Point } from "./globalInterfaces/UtilityInterfaces";
import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";
import { IZIRResetResult, IZIRUpdateResult, IZIREntityResult, IZIRWorldUpdate } from "./globalInterfaces/IServerUpdate";
import { ZIRInput } from "./Input";
import { ZIRPlayerData } from "./PlayerData";
import { ZIRWorldData } from "./WorldData";

export class ZIRClient extends ZIRClientBase {
    public playersOnline: string[];
    private serverComms: IZIRServerCommunications;
    private entities: IZIREntity[];
    private input: ZIRInput;
    private username: string;
    private debugMessages: string[] = ["hello world"];
    private player: ZIRPlayerData;
    private world: ZIRWorldData;

    constructor(comms: IZIRServerCommunications, input: ZIRInput, name: string) {
        super();
        this.serverComms = comms;
        this.input = input;
        this.entities = [];
        this.username = name;
        this.playersOnline = [];
        this.player = new ZIRPlayerData();
        this.world = new ZIRWorldData({zones:[]});
        this.serverComms.setHandler('update', this.handleServerUpdate.bind(this));
        this.serverComms.setHandler('reset', this.handleReset.bind(this));
        this.serverComms.setHandler('message', this.handleMessage.bind(this));
        this.serverComms.setHandler('requestUsername', this.fetchUsername.bind(this));
        this.serverComms.setHandler('debug', this.handleDebugMessage.bind(this));
        this.serverComms.setHandler('updatePlayer', this.updatePlayer.bind(this));
        this.serverComms.setHandler('updateWorld', this.handleWorldUpdate.bind(this));
        this.input.setInputHandler(this.handleInput.bind(this));
        this.serverComms.registerServerListeners();
    }

    private fetchUsername() {
        this.serverComms.sendInfoToServer('rename', this.username);
    }

    private handleMessage(message) {
        console.log("From Server: " + message);
    }

    private handleReset(data: IZIRResetResult) {
        this.entities = [];
        for (var enitity of data.entities) {
            var newEntity = this.parseEntityResult(enitity);
            this.entities[enitity.id] = newEntity;
        }
        this.updateObjects();
    }

    private handleDebugMessage(data: string[]) {
        this.debugMessages = data;
    }

    private handleServerUpdate(data: IZIRUpdateResult) {
        for (var entity of data.updates) {
            var id = entity.id;
            switch (entity.type) {
                case 'update':
                    var newEntity = this.parseEntityResult(entity);
                    this.entities[id] = newEntity;
                    break;
                case 'delete':
                    if (this.entities[id]) {
                        this.entities[id] = undefined;
                    }
                    break;
            }
        }
        this.playersOnline = this.serverComms.getPlayersOnline();
        this.updateObjects();
    }

    private handleWorldUpdate(data: IZIRWorldUpdate) {
        this.world = new ZIRWorldData(data);
    }

    private handleInput(keycode: string, state: boolean) {
        this.serverComms.sendInfoToServer("input", {
            keycode: keycode,
            state: state
        });
    }

    private parseEntityResult(result: IZIREntityResult) {
        var position: Point = {
            x: result.x,
            y: result.y
        }
        var asset: IZIRAsset = ZIRAssetLoader.getAsset(result.asset);
        return new ZIREntityBase(result.id, position, asset);
    }

    private updatePlayer(data) {
        this.player.setPlayerID(data.playerID);
        this.player.setInventory(data.inventory);
    }

    public getPlayersOnline() {
        return this.playersOnline;
    }

    public getDebugMessages() {
        return this.debugMessages;
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }

    public getEntitiesToRender() {
        return this.entities;
    }

    public setUsername(name: string) {
        this.username = name;
    }

    public getPlayerPosition() {
        var player: IZIREntity = this.entities[this.player.getPlayerID()];
        if (player) {
            return player.getPosition();
        }
        return {
            x: 0,
            y: 0
        }
    }

    public getWorldData() {
        return this.world.getWorldData();
    }
}