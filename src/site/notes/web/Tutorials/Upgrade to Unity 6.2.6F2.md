---
{"dg-publish":true,"dg-path":"Tutorials/Upgrade to Unity 6.2.6F2.md","permalink":"/tutorials/upgrade-to-unity-6-2-6-f2/","noteIcon":""}
---

Here is a breakdown of steps on how to upgrade your project to the newest supported version of Unity. 

Since Unity discovered a severe exploit that could lead to the attacker stealing our data from the device, it is very recommended to upgrade your current projects to the new patched version.
Information about the exploit discovery: https://unity.com/security/sept-2025-01

> Important note: Upgrade only the projects that have VR Framework 3.0 installed. Older projects (Unity 2022 or 2021) shall not be upgraded (yet).
 

Before proceeding, please backup your project by making at least a local commit, so that if anything goes wrong, you can always rollback.


1. Click the version next to a project that you want to upgrade:
   ![ProjectSelect.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/ProjectSelect.png)
2. Select the new version (you have to install it first of course).
   ![VersionSelect.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/VersionSelect.png)
3. Click **Open with 6000.2.6f2**.
4. Continue.
   ![UpgradeRequired.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/UpgradeRequired.png)
5. It might prompt you to automatically upgrade some of your scripts, just confirm.
   ![ScriptUpdate.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/ScriptUpdate.png)
6. When the project opens, it will prompt you to upgrade the materials. Just click **OK**.
   ![URPUpgrade.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/URPUpgrade.png)
7. It might also prompt you with this:
   ![DeprecatedPackages.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/DeprecatedPackages.png)
	1. In case it does, click **Open Package Manager**.
	2. Find the deprecated package:
	   ![DeprecatedPackage.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/DeprecatedPackage.png)
	3. Update.
	   ![UpdatePackage.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/UpdatePackage.png)
8. Next update your VRF installation with the VRF Package Manager.
	1. For Training version - upgrade to at least 3.2.0
	2. For Medical version - upgrade to at least 3.7.0
	   ![UpdateVRF.png](/img/user/img/Tutorials/UpgradeToUnity6.2.6f2/UpdateVRF.png)

If there was any error during this process, please contact VRF Team. 