using UnityEngine;

public interface IComExprot
{
    string ClasName { get; }
    bool doExpToLaya { get; }
    string Build(Component com);
    void OnFinish(Component com);
}

public abstract class BaseComExport<T> : MonoBehaviour,IComExprot where T : Component
{
    public T target;

    public virtual bool doExpToLaya => false;

    public abstract string ClasName { get; }

    public string Build(Component com)
    {
        target = com as T;
        return OnBuild();
    }

    public virtual void OnFinish(Component com)
    {
        if (doExpToLaya) Object.DestroyImmediate(com);
    }

    public abstract string OnBuild();
}