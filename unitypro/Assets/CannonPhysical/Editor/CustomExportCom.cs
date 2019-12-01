using System.Collections.Generic;
using UnityEngine;

namespace LayaExport
{
    public class CustomExportCom
    {
        [System.Serializable]
        public class ComInfo
        {
            public string name;
            public string data;
        }
        [System.Serializable]
        public class GameObjectInfo
        {
            public string name;
            public List<ComInfo> coms = new List<ComInfo>();
            public List<GameObjectInfo> childs = new List<GameObjectInfo>();
        }


        public static GameObjectInfo Build(GameObject go)
        {
            var goInfo = new GameObjectInfo();
            goInfo.name = go.name;
            var cs = go.GetComponents<Component>();
            foreach (var c in cs)
            {
                var info = BuildCom(c);
                if (info != null && !string.IsNullOrEmpty(info.data))
                {
                    goInfo.coms.Add(info);
                }
            }

            if (go.transform.childCount > 0)
            {
                for (int i = 0; i < go.transform.childCount; i++)
                {
                    var childInfo = Build(go.transform.GetChild(i).gameObject);
                    if (childInfo.coms.Count > 0)
                    {
                        goInfo.childs.Add(childInfo);
                    }
                }
            }

            return goInfo;
        }

        public static void OnDesAll(GameObject go)
        {
            var cs = go.GetComponents<Component>();
            foreach (var c in cs)
            {
                var exp = CustomExport.allExports.Find(a => a.att.com == c.GetType());
                if (exp != null)
                {
                    var obj = System.Activator.CreateInstance(exp.type) as IComExprot;
                    obj?.OnFinish(c);
                }
            }
            if (go.transform.childCount > 0)
            {
                for (int i = 0; i < go.transform.childCount; i++)
                {
                    OnDesAll(go.transform.GetChild(i).gameObject);
                }
            }
        }

        public static ComInfo BuildCom(Component com)
        {
            ComInfo data = null;
            var exp = CustomExport.allExports.Find(a => a.att.com == com.GetType());
            if (exp != null)
            {
                var build = exp.type.GetMethod("Build");
                var obj = System.Activator.CreateInstance(exp.type) as IComExprot;
                if (build != null)
                {
                    data = new ComInfo
                    {
                        name = obj.ClasName,
                        data = obj.Build(com)
                    };
                    if (string.IsNullOrEmpty(data.data))
                    {
                        data = null;
                    }
//                    if (obj.doExportToLaya)
//                    {
//                        Object.DestroyImmediate(com);
//                    }
                }
            }

            return data;
        }
    }
}