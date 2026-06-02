using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AeroSpace.Astrogator;

namespace AeroSpace.Rocket.Tests;

[TestClass()]
public partial class RocketNewFATests
{
    JsonSerializerOptions options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        ReadCommentHandling = JsonCommentHandling.Skip
    };

    JsonSerializerOptions optionsOutput = new JsonSerializerOptions
    {
        WriteIndented = true,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping  // 中文不转义为 \uXXXX
    };

    /// <summary>
    /// CZ-4B SSO + 1000km， 运载能力: 1500kg
    /// </summary>
    [TestMethod]
    public void CZ4B_SSO_260519()
    {
        string dirPath = Path.Combine(ScRocketStatic.CurrentDir, "DDJS/CZ-4B");
        string filePath = Path.Combine(dirPath, "CZ4B_SSO_260519.json");
        
        string inputStr = File.ReadAllText(filePath, Encoding.UTF8);
        var optim = JsonSerializer.Deserialize<RocketTrajectoryOptim>(inputStr, options);
        Assert.IsNotNull(optim, "JSON 反序列化失败");

        //  运行优化
        var output = optim.Run();

        //  结果信息
        Console.WriteLine($"一级关机推进剂剩余量      :  {output.DicShiXu["mass_y"][1]:F1}");
        Console.WriteLine($"二级游机关机推进剂剩余量  :  {output.DicShiXu["mass_y"][5]:F1}");
        Console.WriteLine($"三级关机推进剂剩余量      :  {output.DicShiXu["mass_y"][7]:F1}");
        Console.WriteLine("");
        var profile = output.Profiles![0] as OptimProfileAlglib;
        Console.WriteLine("运载能力 (kg): " + profile.OptimX[0]);
        Console.WriteLine("");
        Assert.AreEqual(1529.733, profile.OptimX[0], 1.0);

        //  输出结果（也可以改为写入文件）       
        string outputStr = JsonSerializer.Serialize(output, optionsOutput);
        Console.WriteLine(outputStr);

        Assert.IsTrue(output.IsSuccess, "\n优化失败: " + output.Message);


        Assert.IsNotNull(profile, "Profiles[0] 应为 OptimProfileAlglib");
        Assert.IsTrue(profile.OptimTerminationType >= 1, "OptimTerminationType=" + profile.OptimTerminationType);
        Assert.IsTrue(profile.OptimX[0] >= 1500 && profile.OptimX[0] <= 5000, "Gw 应在约束范围内");
    }
}
