using System;
using System.Collections.Generic;
using System.IO;
using LitJson;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;
using Object = UnityEngine.Object;

namespace LayaExport
{
    [Serializable]
    public class JsonData
    {
        public List<CustomExportCom.GameObjectInfo> objInfos = new List<CustomExportCom.GameObjectInfo>();
    }

    public class CustomExport : Util.CustomExport
    {
        public static List<ExportAttributeInfo> allExports = new List<ExportAttributeInfo>();
        private readonly List<GameObject> destoryList = new List<GameObject>();

        private bool isPrefab;

        private readonly JsonData json = new JsonData();
        private readonly List<string> loweringList = new List<string>();

        public void StartHierarchysExport(string savePath)
        {
            loweringList.Clear();
            isPrefab = false;
            json.objInfos.Clear();
            destoryList.Clear();
            var gos = SceneManager.GetActiveScene().GetRootGameObjects();
            for (var i = 0; i < gos.Length; i++)
            {
                var go = gos[i];
                var fileName = "Assets/temps/" + go.name + ".prefab";
                PrefabUtility.SaveAsPrefabAsset(go, fileName);
                loweringList.Add(fileName);
                destoryList.Add(go);
                var info = CustomExportCom.Build(go);
                info.instanceID = i;
                json.objInfos.Add(info);
            }

            foreach (var go in gos) CustomExportCom.OnDesAll(go);
        }

        public bool StartEachHierarchyExport(string hierarchyPath)
        {
            isPrefab = true;
            Debug.Log("StartEachHierarchyExport" + hierarchyPath);
            return true;
        }

        public void EndEachHierarchyExport(string hierarchyPath)
        {
            Debug.Log("EndEachHierarchyExport" + hierarchyPath);
        }

        public void EndHierarchysExport(string savePath)
        {
            if (isPrefab)
            {
                foreach (var j in json.objInfos)
                {
                    var da = new JsonData();
                    da.objInfos.Add(j);
//                    JSONObject.CreateStringObject()
                    var x = JsonMapper.ToJson(j);
                    
                    var path = savePath + "/unitylib/Conventional/" + j.name + ".json";
                    File.WriteAllText(path, x);
                }
            }
            else
            {
                var x = JsonMapper.ToJson(json);
                var path = savePath + "/unitylib/Conventional/" + SceneManager.GetActiveScene().name + ".json";
                File.WriteAllText(path, x);
            }


            foreach (var go in destoryList) Object.DestroyImmediate(go);

            foreach (var fileName in loweringList)
            {
                var go = AssetDatabase.LoadAssetAtPath<GameObject>(fileName);
                var go2 = Object.Instantiate(go);
                go2.name = go.name;
                AssetDatabase.DeleteAsset(fileName);
            }

            AssetDatabase.Refresh();
        }

        [InitializeOnLoadMethod]
        public static void Set()
        {
            allExports.Clear();
            allExports = GetExportAttributeInfo();
            LayaAir3D.customExport = new CustomExport();

            ExporterFunc<Vector3> writeVector3 = (v, w) =>
            {
                w.WriteObjectStart();
                w.WritePropertyName("x");
                w.Write(v.x);
                w.WritePropertyName("y");
                w.Write(v.y);
                w.WritePropertyName("z");
                w.Write(v.z);
                w.WriteObjectEnd();
            };

            ExporterFunc<Vector2> writeVector2 = (v, w) =>
            {
               
                w.WriteObjectStart();
                w.WritePropertyName("x");
                w.Write(v.x);
                w.WritePropertyName("y");
                w.Write(v.y);
                w.WriteObjectEnd();
            };
            JsonMapper.RegisterExporter<float>((obj, writer) => writer.Write(Convert.ToDouble(obj)));
            JsonMapper.RegisterImporter<double, float>(input => Convert.ToSingle(input));
            JsonMapper.RegisterExporter(writeVector2);
            JsonMapper.RegisterExporter(writeVector3);
        }


        public static List<ExportAttributeInfo> GetExportAttributeInfo()
        {
            var list = new List<ExportAttributeInfo>();
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();
            foreach (var assemble in assemblies)
            {
                var xxs = assemble.GetTypes();
                foreach (var t in xxs)
                {
                    var attrs = t.GetCustomAttributes(typeof(ExportAttribute), false);
                    if (attrs.Length > 0)
                        foreach (var attr in attrs)
                        {
                            var attribute = attr as ExportAttribute;
                            if (attribute != null) list.Add(new ExportAttributeInfo {type = t, att = attribute});
                        }
                }
            }

            return list;
        }
    }
}