//
//  CameraController.swift
//  MyJobPitch
//
//  Created by dev on 12/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import LLSimpleCamera

class CameraController: UIViewController {

    enum CaptureStatus {
        case none, ready, capture
    }
    
    @IBOutlet weak var switchButton: UIButton!
    @IBOutlet weak var recordButton: UIButton!
    @IBOutlet weak var countLabel: UILabel!
    
    var captureStatus = CaptureStatus.none
    
    var camera: LLSimpleCamera!
    
    var timer: Timer! {
        willSet(newTimer) {
            if newTimer != nil {
                RunLoop.current.add(newTimer, forMode: RunLoopMode.commonModes)
            } else {
                timer?.invalidate()
            }
        }
    }
    
    var count: Int = 0 {
        didSet {
            countLabel.text = count != 0 ? String(count) : ""
        }
    }
    
    var complete: ((URL?) -> Void)!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        recordButton.layer.cornerRadius = 35
        recordButton.layer.borderColor = UIColor.white.cgColor
        recordButton.layer.borderWidth = 1
        recordButton.backgroundColor = AppData.greenColor
        
        count = 0
        
        let screenSize = UIScreen.main.bounds.size
        camera = LLSimpleCamera(quality: AVCaptureSessionPresetHigh, position: LLCameraPositionFront, videoEnabled: true)
        addChildViewController(camera)
        camera.view.frame = CGRect(x: 0, y: 0, width: screenSize.width, height: screenSize.height)
        view.insertSubview(camera.view, at: 0)
        camera.didMove(toParentViewController: self)
        camera.useDeviceOrientation = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        camera.start()
    }
    
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    func finishCapture() {
        captureStatus = .none
        timer = nil
        recordButton.setTitle("RECORD", for: .normal)
        recordButton.backgroundColor = AppData.greenColor
        camera.stopRecording()
    }
    
    func countDown() {
        count -= 1
        if count == 0 {
            if captureStatus == .ready {
                captureStatus = .capture
                count = 30
                recordButton.setTitle("STOP", for: .normal)
                recordButton.backgroundColor = UIColor.red
                
                let appDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).last!
                let outputURL: URL = appDir.appendingPathComponent("myjobpitch").appendingPathExtension("mov")
                camera.startRecording(withOutputUrl: outputURL, didRecord: { (_, videoURL, error) in
                    if error == nil {
                        self.complete?(videoURL)
                        _ = self.dismiss(animated: true, completion: nil)
                    }
                })
            } else {
                finishCapture()
            }
        }
    }
    
    @IBAction func cameraSwitchAction(_ sender: Any) {
        camera.togglePosition()
    }
    
    @IBAction func closeAction(_ sender: Any) {
        timer = nil
        _ = dismiss(animated: true, completion: nil)
    }
    
    @IBAction func recordAction(_ sender: Any) {

        switch captureStatus {
        case .none:
            captureStatus = .ready
            count = 10
            timer = Timer(timeInterval: 1, target: self, selector: #selector(countDown), userInfo: nil, repeats: true)
            recordButton.setTitle("READY", for: .normal)
            recordButton.backgroundColor = AppData.yellowColor
            switchButton.isHidden = true
        case .ready:
            captureStatus = .none
            count = 0
            timer = nil
            recordButton.setTitle("RECORD", for: .normal)
            recordButton.backgroundColor = AppData.greenColor
            switchButton.isHidden = false
        case .capture:
            finishCapture()
        }
    }
    
}
