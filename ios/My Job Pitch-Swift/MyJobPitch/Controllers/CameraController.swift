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
    @IBOutlet weak var countLabel: UILabel!
    @IBOutlet weak var recordButtonIcon: UIView!
    
    var captureStatus = CaptureStatus.none {
        didSet {
            countLabel.superview?.superview?.isHidden = captureStatus != .ready
            recordButtonIcon.layer.cornerRadius = captureStatus == .none ? 16 : 4
        }
    }
    
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

        countLabel.superview?.layer.cornerRadius = 50
        countLabel.superview?.layer.borderColor = UIColor.white.cgColor
        countLabel.superview?.layer.borderWidth = 3
        recordButtonIcon.layer.cornerRadius = 16
        recordButtonIcon.superview?.layer.cornerRadius = 40
        
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
        camera.stopRecording()
    }
    
    func countDown() {
        count -= 1
        if count == 0 {
            if captureStatus == .ready {
                captureStatus = .capture
                count = 30
                
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
            switchButton.isHidden = true
        case .ready:
            captureStatus = .none
            count = 0
            timer = nil
            switchButton.isHidden = false
        case .capture:
            finishCapture()
        }
    }
    
    static func instantiate() -> CameraController {
        return AppHelper.instantiate("Camera") as! CameraController
    }
    
}
