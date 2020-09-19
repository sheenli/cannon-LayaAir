import {PhysicsComponent} from "./PhysicsComponent"

export class CannonPhysicalCtrl {
    public world: OIMO.World
    private fixedTimeStep = 1.0 / 60.0
    private maxSubSteps = 3

    private updateList = new Array<PhysicsComponent>()
    private updateToPyList = new Array<PhysicsComponent>()

    public addToUpdateToPyList(com: PhysicsComponent) {
        this.updateToPyList.push(com)
    }

    addBody(com: PhysicsComponent) {
        let index = this.updateList.findIndex(a => a == com)
        if (index == -1 && com.Body) {
            this.world.addRigidBody(com.Body)
            this.updateList.push(com)
        }
        
    }

    removeBody(com: PhysicsComponent) {
        if (com.Body) {
            this.world.removeRigidBody(com.Body)
            let index = this.updateList.findIndex(a => a == com)
            if (index != -1) this.updateList.splice(index, 1)
        }
    }

    init() {
        this.world = new OIMO.World({
            timestep: 1/60,
            iterations: 8,
            broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
            worldscale: 1,
            random: true,
            info:false ,
            gravity:[0,-10,0]
        })
        Laya.timer.frameLoop(1, this, this.update, null, true)
    }

    private update() {

        PhysicsComponent.canAdd = false
        for (let i = 0; i < this.updateToPyList.length; i++) {
            this.updateToPyList.pop().updatePhysicsTransformFromRender()
        }
        this.world.step()

        for (let i = 0; i < this.updateList.length; i++) {
            this.updateList[i].updateTransformPhysicsComponent()
        }
        PhysicsComponent.canAdd = true
    }

}
