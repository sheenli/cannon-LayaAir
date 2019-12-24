using System;
using System.Collections.Generic;
using LitJson;
using UnityEngine;

namespace LayaExport
{
    [Serializable]
    public class BodyData
    {
        public int constraints;
        public float linearDamping;
        public float mass;
        public List<ShapeData> shapes = new List<ShapeData>();
        public int type;
    }

    [Serializable]
    public class BoxData : ShapeData
    {
        [SerializeField] public Vector3 center;

        [SerializeField] public Vector3 size;
    }

    [Serializable]
    public class ShapeData
    {
        public enum Types
        {
            SPHERE = 1,
            PLANE = 2,
            BOX = 4,
            COMPOUND = 8,
            CONVEXPOLYHEDRON = 16,
            HEIGHTFIELD = 32,
            PARTICLE = 64,
            CYLINDER = 128
        }

        public int type;
    }

#if USECANNON
    [Export(typeof(Rigidbody))]
    public class Body : BaseComExport<Rigidbody>
    {
        public static int DYNAMIC = 1;
        public static int STATIC = 2;
        public static int KINEMATIC = 4;
        public override bool doExpToLaya => true;

        public override string ClasName => "YK.Body";

        public override string OnBuild()
        {
            var data = string.Empty;
            var info = new BodyData();
            if (target.isKinematic) info.type = KINEMATIC;
            else if (!target.useGravity || target.mass == 0) info.type = STATIC;
            else
                info.type = DYNAMIC;

            info.constraints = (int) target.constraints;
            info.mass = target.mass;
            info.linearDamping = target.drag;

            var cs = target.transform.GetComponents<Collider>();
            foreach (var c in cs)
            {
                ShapeData d = null;
                if (c is BoxCollider)
                {
                    var box = new Box();
                    box.target = c as BoxCollider;
                    d = box.ToData();
                }

                if (d != null) info.shapes.Add(d);
            }

            return JsonMapper.ToJson(info);
        }
    }

    [Export(typeof(BoxCollider))]
    public class Box : BaseComExport<BoxCollider>
    {
        public override bool doExpToLaya => true;
        public override string ClasName => "YK.Body";

        public override string OnBuild()
        {
            var data = string.Empty;
            var rig = target.transform.gameObject.GetComponent<Rigidbody>();
            if (rig != null)
            {
                return data;
            }

            var info = new BodyData();
            info.type = Body.KINEMATIC;
            info.mass = 1;
            info.shapes.Add(ToData());
            data = JsonMapper.ToJson(info);

            return data;
        }

        public BoxData ToData()
        {
            var data = new BoxData();
            data.type = (int) ShapeData.Types.BOX;
            data.center = target.center;
            data.size = target.size;
            return data;
        }
    }
#endif
    
}