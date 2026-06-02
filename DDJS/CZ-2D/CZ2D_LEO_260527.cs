using System.Text;
using System.Text.Json;
using AeroSpace.Astrogator;

namespace AeroSpace.Rocket.Tests;

public partial class RocketNewFATests
{
     /// <summary>
    /// CZ-2D LEO + 35°,500km高度,运载能力: 2500kg
    /// </summary>
    [TestMethod]
    public void CZ2D_LEO_260527()
    {
        string dirPath = Path.Combine(ScRocketStatic.CurrentDir, "DDJS/CZ-2D");
        string filePath = Path.Combine(dirPath, "CZ2D_LEO_260527.json");
        
        string inputStr = File.ReadAllText(filePath, Encoding.UTF8);
        var optim = JsonSerializer.Deserialize<RocketTrajectoryOptim>(inputStr, options);
        Assert.IsNotNull(optim, "JSON 反序列化失败");

        //  运行优化
        var output = optim.Run();

        //  结果信息
        Console.WriteLine($"一级关机推进剂剩余量      :  {output.DicShiXu["mass_y"][1]:F1}");
        Console.WriteLine($"二级游机关机推进剂剩余量  :  {output.DicShiXu["mass_y"][5]:F1}");
        Console.WriteLine("");
        var profile = output.Profiles![0] as OptimProfileAlglib;
        Console.WriteLine("运载能力 (kg): " + profile.OptimX[0]);
        Console.WriteLine("");
        Assert.AreEqual(2418.9, profile.OptimX[0], 1.0, "运载能力与预期不符");

        //  输出结果（也可以改为写入文件）       
        string outputStr = JsonSerializer.Serialize(output, optionsOutput);
        Console.WriteLine(outputStr);

        Assert.IsTrue(output.IsSuccess, "\n优化失败: " + output.Message);

     
        Assert.IsNotNull(profile, "Profiles[0] 应为 OptimProfileAlglib");
        Assert.IsTrue(profile.OptimTerminationType >= 1, "OptimTerminationType=" + profile.OptimTerminationType);

    }
}
