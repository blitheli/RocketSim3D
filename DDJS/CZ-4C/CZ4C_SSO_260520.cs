using System.Text;
using System.Text.Json;
using AeroSpace.Astrogator;

namespace AeroSpace.Rocket.Tests;

public partial class RocketNewFATests
{
    /// <summary>
    /// CZ-4C SSO(700km) DDJS. 大整流罩1650kg, 运载能力: 3300kg
    /// </summary>
    [TestMethod]
    public void CZ4C_SSO_260520()
    {
        string dirPath = Path.Combine(ScRocketStatic.CurrentDir, "DDJS/CZ-4C");
        string filePath = Path.Combine(dirPath, "CZ4C_SSO_260520.json");

        string inputStr = File.ReadAllText(filePath, Encoding.UTF8);
        var optim = JsonSerializer.Deserialize<RocketTrajectoryOptim>(inputStr, options);
        Assert.IsNotNull(optim, "JSON 反序列化失败");

        var output = optim.Run();

        Assert.IsTrue(output.IsSuccess, "\n优化失败: " + output.Message);

        Console.WriteLine($"一级关机推进剂剩余量      :  {output.DicShiXu["mass_y"][1]:F1}");
        Console.WriteLine($"二级游机关机推进剂剩余量  :  {output.DicShiXu["mass_y"][5]:F1}");
        Console.WriteLine($"三级一次关机推进剂剩余量  :  {output.DicShiXu["mass_y"][7]:F1}");
        Console.WriteLine($"三级二次关机推进剂剩余量  :  {output.DicShiXu["mass_y"][9]:F1}");
        Console.WriteLine("");
        var profile = output.Profiles![0] as OptimProfileAlglib;
        Console.WriteLine("运载能力 (kg): " + profile.OptimX[0]);
        Assert.AreEqual(3263.5, profile.OptimX[0], 1.0);

        string outputStr = JsonSerializer.Serialize(output, optionsOutput);
        Console.WriteLine(outputStr);

        Assert.IsNotNull(profile, "Profiles[0] 应为 OptimProfileAlglib");
        Assert.IsTrue(profile.OptimTerminationType >= 1, "OptimTerminationType=" + profile.OptimTerminationType);
        Assert.IsTrue(profile.OptimX[0] > 3000, $"700km SSO 运载能力应大于 3t, Gw={profile.OptimX[0]:F3} kg");
    }
}
