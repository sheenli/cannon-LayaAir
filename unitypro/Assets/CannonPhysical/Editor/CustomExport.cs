using System;
using System.Collections.Generic;
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

        [InitializeOnLoadMethod]
        public static void Set()
        {
            allExports.Clear();
            allExports = GetExportAttributeInfo();
            LayaAir3D.customExport = new CustomExport();
        }

        private JsonData json = new JsonData();
        private List<string> loweringList = new List<string>();
        private List<GameObject> destoryList = new List<GameObject>();

        public void StartHierarchysExport(string savePath)
        {
            loweringList.Clear();
            isPrefab = false;
            json.objInfos.Clear();
            destoryList.Clear();
            var gos = SceneManager.GetActiveScene().GetRootGameObjects();
            foreach (var go in gos)
            {
                var fileName = "Assets/temps/" + go.name + ".prefab";
                PrefabUtility.SaveAsPrefabAsset(go, fileName);
                loweringList.Add(fileName);
                destoryList.Add(go);
                var info = CustomExportCom.Build(go);
                json.objInfos.Add(info);
            }
            foreach (var go in gos)
            {
                CustomExportCom.OnDesAll(go);
            }
        }

        private bool isPrefab = false;

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
                    JsonData da = new JsonData();
                    da.objInfos.Add(j);
                    var x = JsonUtility.ToJson(da);
                    string path = savePath.Substring(0, savePath.IndexOf("unitylib/", StringComparison.Ordinal) + 9)
                                  + "/" + da.objInfos[0].name + ".json";
                    System.IO.File.WriteAllText(path, x);
                }
            }
            else
            {
                var x = JsonUtility.ToJson(json);
                var path = savePath + "/unitylib/Conventional/" + SceneManager.GetActiveScene().name + ".json";
                System.IO.File.WriteAllText(path, x);
            }

            

            foreach (var go in destoryList)
            {
                Object.DestroyImmediate(go);
            }

            foreach (var fileName in loweringList)
            {
                var go = AssetDatabase.LoadAssetAtPath<GameObject>(fileName);
                var go2 = Object.Instantiate(go);
                go2.name = go.name;
                AssetDatabase.DeleteAsset(fileName);
            }

            AssetDatabase.Refresh();
        }


        public static List<ExportAttributeInfo> GetExportAttributeInfo()
        {
            List<ExportAttributeInfo> list = new List<ExportAttributeInfo>();
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();
            foreach (var assemble in assemblies)
            {
                var xxs = assemble.GetTypes();
                foreach (var t in xxs)
                {
                    var attrs = t.GetCustomAttributes(typeof(ExportAttribute), false);
                    if (attrs.Length > 0)
                    {
                        foreach (var attr in attrs)
                        {
                            var attribute = attr as ExportAttribute;
                            if (attribute != null)
                            {
                                list.Add(new ExportAttributeInfo {type = t, att = attribute});
                            }
                        }
                    }
                }
            }

            return list;
        }
    }
}