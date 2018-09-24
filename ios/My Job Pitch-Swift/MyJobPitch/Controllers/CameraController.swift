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

    @IBOutlet weak var switchButton: UIButton!
    @IBOutlet weak var recordButtonIcon: UIView!
    @IBOutlet weak var readyCountLabel: UILabel!
    
    @IBOutlet weak var recIcon: CircleView!
    @IBOutlet weak var recTimeLabel: UILabel!
    @IBOutlet weak var progressBar: UIProgressView!
    @IBOutlet weak var hintLabel: UILabel!
    
    enum CaptureStatus {
        case none, ready, capture
    }
    
    public var complete: ((URL?) -> Void)!
    
    var camera: LLSimpleCamera!
    
    var timer: Timer! {
        willSet(newTimer) {
            if timer != nil {
                timer?.invalidate()
            }
        }
    }
    
    var recIconTimer: Timer! {
        willSet(newRecIconTimer) {
            if recIconTimer != nil {
                recIconTimer?.invalidate()
            }
        }
    }

    var captureStatus = CaptureStatus.none {
        didSet {
            recordButtonIcon.layer.cornerRadius = captureStatus == .none ? 16 : 4
            readyCountLabel.superview?.superview?.isHidden = captureStatus != .ready
            recIcon.superview?.isHidden = captureStatus != .capture
            progressBar.isHidden = captureStatus != .capture
            hintLabel.isHidden = captureStatus == .capture
        }
    }
    
    var readyCount = 0 {
        didSet {
            readyCountLabel.text = "\(readyCount)"
        }
    }
    
    var recTime: Float = 0 {
        didSet {
            progressBar.progress = 1 - recTime / 30000
            let time = Int(recTime / 1000)
            let minute = time / 60
            let second = time % 60
            recTimeLabel.text = "\(minute):" + (second < 10 ? "0\(second)" : "\(second)")
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        let screenSize = UIScreen.main.bounds.size
        camera = LLSimpleCamera(quality: AVCaptureSessionPresetHigh, position: LLCameraPositionFront, videoEnabled: true)
        addChildViewController(camera)
        camera.view.frame = CGRect(x: 0, y: 0, width: screenSize.width, height: screenSize.height)
        view.insertSubview(camera.view, at: 0)
        camera.didMove(toParentViewController: self)
        camera.useDeviceOrientation = true
        
        readyCountLabel.superview?.layer.borderColor = UIColor.white.cgColor
        readyCountLabel.superview?.layer.borderWidth = 3
        recIcon.superview?.layer.cornerRadius = 4
        
        captureStatus = .none
        recIconTimer = Timer.scheduledTimer(timeInterval: 0.5, target: self, selector: #selector(blinkRecIcon), userInfo: nil, repeats: true)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        camera.start()
    }
    
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    func blinkRecIcon() {
        recIcon.isHidden = !recIcon.isHidden
    }
    
    func finishCapture() {
        timer = nil
        recIconTimer = nil
        camera.stopRecording()
    }
    
    func countDown1() {
        readyCount -= 1
        if readyCount == 0 {
            let appDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).last!
            let outputURL: URL = appDir.appendingPathComponent("myjobpitch").appendingPathExtension("mov")
            camera.startRecording(withOutputUrl: outputURL, didRecord: { (_, videoURL, error) in
                if error == nil {
                    self.complete?(videoURL)
                    _ = self.dismiss(animated: true, completion: nil)
                }
            })
            
            captureStatus = .capture
            recTime = 0
            timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(countDown2), userInfo: nil, repeats: true)
        }
    }
    
    func countDown2() {
        recTime += 100
        if recTime >= 30000 {
            finishCapture()
        }
    }
    
    @IBAction func recordAction(_ sender: Any) {

        switch captureStatus {
        case .none:
            captureStatus = .ready
            readyCount = 10
            timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(countDown1), userInfo: nil, repeats: true)
            switchButton.isHidden = true
        case .ready:
            captureStatus = .none
            timer = nil
            switchButton.isHidden = false
        case .capture:
            finishCapture()
        }
    }
    
    @IBAction func cameraSwitchAction(_ sender: Any) {
        camera.togglePosition()
    }
    
    @IBAction func closeAction(_ sender: Any) {
        timer = nil
        recIconTimer = nil
        _ = dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> CameraController {
        return AppHelper.instantiate("Camera") as! CameraController
    }
    
}
