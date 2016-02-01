//
//  MessageThread.m
//  My Job Pitch
//
//  Created by user on 01/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MessageThread.h"
#import "MessageThreadCell.h"
#import "Message.h"
#import "JobDetails.h"

@interface MessageThread ()

@end

@implementation MessageThread

- (void)viewDidLoad {
    [super viewDidLoad];
    [self showProgress:false];
    self.messages.rowHeight = UITableViewAutomaticDimension;
    self.messages.estimatedRowHeight = 96;
    self.messages.delegate = self;
    self.messages.dataSource = self;
}

- (void)viewWillAppear:(BOOL)animated
{
    ApplicationStatus *statusCreated = [self.appDelegate getApplicationStatusByName:APPLICATION_CREATED];
    if ([self.appDelegate.user isJobSeeker]) {
        self.from.text = self.application.job.locationData.businessData.name;
        Image *image = [self.application.job getImage];
        if (image) {
            [self loadImageURL:image.thumbnail
                          into:self.image
                 withIndicator:self.imageActivity];
        } else {
            self.image.image = nil;
        }
        if ([self.application.status isEqual:statusCreated.id]) {
            self.messageInput.text = @"You cannot send messages until your application is accepted";
            self.messageInput.editable = false;
            self.sendButton.enabled = false;
            self.sendButton.alpha = 0.5;
        }

    } else {
        self.from.text = [NSString stringWithFormat:@"%@ %@",
                          self.application.jobSeeker.firstName,
                          self.application.jobSeeker.lastName];
        Pitch *pitch = [self.application.jobSeeker getPitch];
        if (pitch) {
            [self loadImageURL:pitch.thumbnail
                          into:self.image
                 withIndicator:self.imageActivity];
        } else {
            self.image.image = nil;
        }
        
        if ([self.application.status isEqual:statusCreated.id]) {
            self.messageInput.text = @"You cannot send messages until you have connected";
            self.messageInput.editable = false;
            self.sendButton.enabled = false;
            self.sendButton.alpha = 0.5;
        }
    }
    
    self.job.text = [NSString stringWithFormat:@"%@ (%@, %@)",
                     self.application.job.title,
                     self.application.job.locationData.name,
                     self.application.job.locationData.businessData.name];
}

-(void)viewDidAppear:(BOOL)animated
{
    [self.messages scrollToRowAtIndexPath:[NSIndexPath
                                           indexPathForRow:self.application.messages.count-1
                                           inSection:0]
                         atScrollPosition:UITableViewScrollPositionBottom
                                 animated:true];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.application.messages.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    MessageThreadCell *cell = [self.messages dequeueReusableCellWithIdentifier:@"MessageThreadCell"];
    Message *message = [self.application.messages objectAtIndex:indexPath.row];
    Role *userRole = [self.appDelegate getUserRole];
    Role *fromRole = [self.appDelegate getRole:message.fromRole];
    if ([fromRole isEqual:userRole]) {
        cell.rightContraint.priority = UILayoutPriorityDefaultHigh;
    } else {
        cell.rightContraint.priority = UILayoutPriorityDefaultLow;
    }
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *today = [calendar startOfDayForDate:[NSDate date]];
    NSDate *createdDate = [calendar startOfDayForDate:message.created];
    NSDateFormatter *timeFormat = [[NSDateFormatter alloc] init];
    [timeFormat setDateFormat:@"HH:mma"];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"dd/MM/yyyy"];
    NSString *created;
    if ([createdDate isEqual:today])
        created = [NSString stringWithFormat:@"Today, %@",
                   [timeFormat stringFromDate:message.created]];
    else
        created = [NSString stringWithFormat:@"%@, %@",
                   [dateFormat stringFromDate:message.created],
                   [timeFormat stringFromDate:message.created]];
    if ([fromRole isEqual:[self.appDelegate getRoleByName:ROLE_RECRUITER]]) {
        cell.byLine.text = [NSString stringWithFormat:@"%@, %@",
                            self.application.job.locationData.businessData.name,
                            created];
    } else {
        cell.byLine.text = [NSString stringWithFormat:@"%@ %@, %@",
                            self.application.jobSeeker.firstName,
                            self.application.jobSeeker.lastName,
                            created];
    }
    cell.message.text = message.content;
    cell.backgroundColor = [UIColor clearColor];
    return cell;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_job_details"]) {
        JobDetails *jobDetailsView = [segue destinationViewController];
        [jobDetailsView setJob:self.application.job];
        [jobDetailsView setApplication:self.application];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (IBAction)headerTap:(id)sender {
    if ([self.appDelegate.user isJobSeeker]) {
        [self performSegueWithIdentifier:@"goto_job_details" sender:nil];
    }
}

- (IBAction)send:(id)sender {
    if (![self.messageInput.text isEqualToString:@""]) {
        MessageForCreation *message = [[MessageForCreation alloc] init];
        message.content = self.messageInput.text;
        message.application = self.application.id;
        self.sendButton.enabled = false;
        self.sendButton.alpha = 0.5;
        self.messageInput.editable = false;
        [self.appDelegate.api sendMessage:message
                                  success:^(MessageForCreation *message) {
                                      self.sendButton.enabled = true;
                                      self.sendButton.alpha = 1.0;
                                      self.messageInput.editable = true;
                                      self.messageInput.text = @"";
                                  } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                      self.sendButton.enabled = true;
                                      self.sendButton.alpha = 1.0;
                                      self.messageInput.editable = true;
                                      [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                  message:@"Error loading data"
                                                                 delegate:self
                                                        cancelButtonTitle:@"Okay"
                                                        otherButtonTitles:nil] show];
                                  }];
    }
}

@end
