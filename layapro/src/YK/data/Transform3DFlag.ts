export class Transform3DFlag {
    /**@internal */
    static TRANSFORM_LOCALQUATERNION: number = 0x01;
    /**@internal */
    static TRANSFORM_LOCALEULER: number = 0x02;
    /**@internal */
    static TRANSFORM_LOCALMATRIX: number = 0x04;
    /**@internal */
    static TRANSFORM_WORLDPOSITION: number = 0x08;
    /**@internal */
    static TRANSFORM_WORLDQUATERNION: number = 0x10;
    /**@internal */
    static TRANSFORM_WORLDSCALE: number = 0x20;
    /**@internal */
    static TRANSFORM_WORLDMATRIX: number = 0x40;
    /**@internal */
    static TRANSFORM_WORLDEULER: number = 0x80;
}