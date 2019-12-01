
using System;
using System.Collections.Generic;
using UnityEngine;

namespace LayaExport
{
    [System.Serializable]
    public class BodyData
    {
        public float mass;
        public int type;
        public float linearDamping;
        public int constraints;
        public List<string> shapes = new List<string>();
    }

    [Serializable]
    public class BoxData : ShapeData
    {
        [SerializeField] 
        public Vector3 center;
        [SerializeField] 
        public Vector3 size;
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
            CYLINDER = 128,
        }

        public int type;
    }

    [Export(typeof(Rigidbody))]
    public class Body : BaseComExprot<Rigidbody>
    {
        public static int DYNAMIC = 1;
        public static int STATIC = 2;
        public static int KINEMATIC = 4;

        public override string ClasName => "YK.Body";

        public override string OnBuild()
        {
            var data = string.Empty;
            var info = new BodyData();
            if (target.isKinematic) info.type = KINEMATIC;
            else if (!target.useGravity || target.mass == 0) info.type = STATIC;
            else
            {
                info.type = DYNAMIC;
            }

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
//                    Object.DestroyImmediate(c);
                }

                if (d != null)
                {
                    info.shapes.Add(JsonUtility.ToJson(d));
                }
            }

            return JsonUtility.ToJson(info);
        }
    }

    [Export(typeof(BoxCollider))]
    public class Box : BaseComExprot<BoxCollider>
    {
        public override string ClasName => "YK.Body";

        public override string OnBuild()
        {
            var data = string.Empty;
            var rig = target.transform.gameObject.GetComponent<Rigidbody>();
            if (rig != null)
            {
                return data;
            }
            else
            {
                var info = new BodyData();
                info.type = Body.STATIC;
                info.mass = 0;
                info.shapes.Add(JsonUtility.ToJson(ToData()));
                data = JsonUtility.ToJson(info);
            }

            return data;
        }

        public BoxData ToData()
        {
            var data = new BoxData();
            data.type = (int) ShapeData.Types.BOX;
            data.center = target.center;
            data.center.x *= -1;
            data.size = target.size;
            return data;
            //target.size;
        }
    }
}