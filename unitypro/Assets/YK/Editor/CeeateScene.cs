using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;

public class CeeateScene
{
    private static GameObject TestRoot;

    [MenuItem("GameObject/UI/Remove")]
    public static void Remove()
    {
        
        var selects = Selection.gameObjects;
        foreach (var select in selects)
        {
            var arr = select.GetComponents<SphereCollider>();
            foreach (var VARIABLE in arr)
            {
                Component.DestroyImmediate(VARIABLE);
            }
            
            var arr1 = select.GetComponents<Collider>();
            foreach (var VARIABLE in arr1)
            {
                Component.DestroyImmediate(VARIABLE);
            }

//            var sps = GameObject.Find("Ring (1)").GetComponents<SphereCollider>();
//            foreach (var sp in sps)
//            {
//                var s = select.AddComponent<SphereCollider>();
//                s.center = sp.center;
//                s.radius = sp.radius;
//            }
            
            var size = new Vector3(0.5f,1.58f,0.5f);
            var offset = 0.66f;
            
            var box1 = select.AddComponent<BoxCollider>();
            box1.center = new Vector3(0,0,offset);
            box1.size = new Vector3(size.x,size.y,size.z);
            var box2 = select.AddComponent<BoxCollider>();
            box2.center = new Vector3(0,0,-offset);
            box2.size = new Vector3(size.x,size.y,size.z);
            
            var box3 = select.AddComponent<BoxCollider>();
            box3.center = new Vector3(0,-offset,0);
            box3.size = new Vector3(size.x,size.z,size.y);
            
            var box4 = select.AddComponent<BoxCollider>();
            box4.center = new Vector3(0,offset,0);
            box4.size = new Vector3(size.x,size.z,size.y);
        }
    }
    
    [MenuItem("Assets/创建场景")]
    public static void Create()
    {
        var selects = Selection.objects;
        if (selects[0] is TextAsset)
        {
            TestRoot = GameObject.Find("TestRoot");
            if (TestRoot != null) Object.DestroyImmediate(TestRoot);
            TestRoot = new GameObject("TestRoot");
            var txt = (selects[0] as TextAsset).text;
            var sceneData = JsonUtility.FromJson<SceneData>(txt);
            for (var i = 0; i < sceneData.TubePoints.Length - 1; i++)
            {
                var next = sceneData.TubePoints[i + 1];
                CreateTube(sceneData.TubePoints[i], next, i);
            }

            var j = 0;
            foreach (var tubePoint in sceneData.Rings)
            {
                CreateRing(tubePoint.Position,tubePoint.Normal,j);
                j++;
            }
        }
    }

    public static void CreateTube(Vector3 pos, Vector3 next, int index)
    {
        var p1 = pos;
        var p1R = p1;
        p1R.x += 1;
        var p2 = next;
        var angle = Vector3.Angle(p1R - p1, p2 - p1);
        if (p1.y > p2.y) angle = -angle;
        var dis = Vector3.Distance(next, pos);
        Debug.Log("index:" + index + "/angle:" + angle);
        var obj = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefab/Cylinder.prefab");
        var go = Object.Instantiate(obj, TestRoot.transform, false);
        go.name = index.ToString();
        go.transform.position = pos;
        var offset = 0.1f + Mathf.Abs(angle) / 180 * 0.1f;
//        go.transform.GetChild(0).localScale = new Vector3(1, 1, dis / 0.5f + offset);
//        go.transform.GetChild(0).transform.localPosition = new Vector3(go.transform.GetChild(0).localScale.z / 4, 0, 0);

        go.transform.localScale = new Vector3(dis / 0.5f + offset, 1, 1);
        go.transform.eulerAngles = new Vector3(0, 0, angle);
    }

    public static void CreateRing(Vector3 pos,Vector3 normalize,int j)
    {
        var obj = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefab/Ring.prefab");
        var go = Object.Instantiate(obj, TestRoot.transform, false);
        if (normalize.y > 0)
        {
            go.transform.localEulerAngles = new Vector3(0,0,90);
           
        }
        go.name = "ring" + j;
        go.transform.position = pos;
    }

    [MenuItem("Assets/拷贝文件")]
    public static void ChangNames()
    {
        var files = Directory.GetFiles("Assets/New Folder/TextAsset/");
        foreach (var file in files)
        {
            var name = Path.GetFileName(file);
            if (name.StartsWith("Level_") && !name.EndsWith(".meta"))
                File.Copy(file, "D:/xiuxian/hook/LayaPro/bin/table/" + name.Replace(".txt", ".json"));
        }
    }
}

[Serializable]
public class SceneData
{
    public Vector3 EndPointPosition;
    public RingData[] Rings;
    public Vector3[] TubePoints;
}

[Serializable]
public class RingData
{
    public Vector3 Normal;
    public Vector3 Position;
}