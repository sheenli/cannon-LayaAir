using UnityEngine;

public interface IComExprot
{
    string ClasName { get; }
    string Build(Component com);
    void OnFinish(Component com);
    bool doExpToLaya { get; }
}

public abstract class BaseComExprot<T> : IComExprot where T : Component
{
    public virtual bool doExpToLaya
    {
        get { return true; }
    }
    public T target;
    public abstract string ClasName { get; }

    public string Build(Component com)
    {
        target = com as T;
        return OnBuild();
    }

    public virtual void OnFinish(Component com)
    {
        if (doExpToLaya)
        {
            Object.DestroyImmediate(com);
        }
    }

    public abstract string OnBuild();
}